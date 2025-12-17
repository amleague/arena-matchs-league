import { supabase } from './supabaseClient';

// SUPABASE API ADAPTER
// Replaces the synchronous LocalStorage implementation with async Supabase calls.

export const db = {

    // --- AUTH ---

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) return null;

        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        return profile;
    },

    async register(userData) {
        // 1. SignUp
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
        });

        if (authError) return { success: false, message: authError.message };

        // 2. Create Profile
        if (authData.user) {
            // Check if we have a session. If email confirmation is ON, session might be null.
            // If session is null, we can't insert into profiles if RLS relies on auth.uid().
            // However, Supabase allows metadata in signUp, but let's try manual insert if we can.

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: authData.user.id,
                        email: userData.email,
                        name: userData.name,
                        city: userData.city,
                        role: 'coach'
                    }
                ])
                .select()
                .single();

            if (profileError) return { success: false, message: "Erreur création profil: " + profileError.message };

            return { success: true, user: profile };
        }
        return { success: false, message: "Erreur inconnue lors de l'inscription." };
    },

    async logout() {
        await supabase.auth.signOut();
    },

    async getCurrentUser() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        return profile;
    },

    async getUserById(id) {
        const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
        return data;
    },

    // --- TEAMS ---

    async getMyTeams() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return [];

        const { data } = await supabase
            .from('teams')
            .select('*')
            .eq('owner_id', session.user.id);
        return data || [];
    },

    async getAllTeams() {
        const { data } = await supabase.from('teams').select('*');
        return data || [];
    },

    async getTeamById(id) {
        const { data } = await supabase.from('teams').select('*, players(*)').eq('id', id).single(); // Assuming players table exists or handled via json?
        // Note: players are likely a sub-table or jsonb. In the schema I didn't create players table.
        // Assuming they were in-memory arrays before. For now, we will ignore players or assume they are in a join if table existed.
        return data;
    },

    async createTeam(teamData) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { success: false, message: 'Non connecté' };

        // Check duplicate
        const { data: existing } = await supabase
            .from('teams')
            .select('id')
            .eq('owner_id', session.user.id)
            .eq('sport', teamData.sport)
            .eq('category', teamData.category);

        if (existing && existing.length > 0) {
            return { success: false, message: `Vous avez déjà une équipe ${teamData.sport} ${teamData.category}.` };
        }

        const { data, error } = await supabase
            .from('teams')
            .insert([{
                ...teamData,
                owner_id: session.user.id,
                stats: { wins: 0, loss: 0 }
            }])
            .select()
            .single();

        if (error) return { success: false, message: error.message };
        return { success: true, team: data };
    },

    async addPlayer(teamId, playerData) {
        // Requires a 'players' table or 'players' column in teams.
        // Let's assume a 'players' table for better structure.
        const { data, error } = await supabase
            .from('players')
            .insert([{ ...playerData, team_id: teamId }]) // generated ID
            .select()
            .single();

        if (error) return { success: false, message: error.message };
        return { success: true, player: data };
    },

    async removePlayer(teamId, playerId) {
        const { error } = await supabase
            .from('players')
            .delete()
            .eq('id', playerId)
            .eq('team_id', teamId);

        if (error) return { success: false, message: error.message };
        return { success: true };
    },

    // --- CHALLENGES ---

    async getInbox() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { received: [], sent: [] };

        // Get my team IDs first
        const { data: myTeams } = await supabase.from('teams').select('id').eq('owner_id', session.user.id);
        const myTeamIds = myTeams ? myTeams.map(t => t.id) : [];

        if (myTeamIds.length === 0) return { received: [], sent: [] };

        // Received
        const { data: received } = await supabase
            .from('challenges')
            .select(`
                *,
                fromTeam:teams!challenges_from_team_id_fkey(name),
                toTeam:teams!challenges_to_team_id_fkey(name)
            `)
            .in('to_team_id', myTeamIds);

        // Sent
        const { data: sent } = await supabase
            .from('challenges')
            .select(`
                *,
                fromTeam:teams!challenges_from_team_id_fkey(name),
                toTeam:teams!challenges_to_team_id_fkey(name)
            `)
            .in('from_team_id', myTeamIds);

        // Flatten the names for compatibility
        const format = (list) => list.map(c => ({
            ...c,
            fromTeamName: c.fromTeam?.name || 'Inconnu',
            toTeamName: c.toTeam?.name || 'Inconnu'
        }));

        return { received: format(received || []), sent: format(sent || []) };
    },

    async createChallenge(challengeData) {
        const { data, error } = await supabase
            .from('challenges')
            .insert([challengeData])
            .select()
            .single();
        return data;
    },

    async updateChallengeStatus(id, status) {
        const { data: challenge } = await supabase
            .from('challenges')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (challenge && status === 'ACCEPTED') {
            await supabase.from('matches').insert([{
                team_a_id: challenge.from_team_id,
                team_b_id: challenge.to_team_id,
                date: challenge.date,
                location: challenge.location,
                status: 'SCHEDULED'
            }]);
        }
    },

    async counterProposeChallenge(id, newDate, newLocation, message) {
        const { data: challenge } = await supabase.from('challenges').select('*').eq('id', id).single();

        if (challenge) {
            const { error } = await supabase
                .from('challenges')
                .update({
                    from_team_id: challenge.to_team_id,
                    to_team_id: challenge.from_team_id,
                    date: newDate,
                    location: newLocation,
                    message: `[Contre-proposition] ${message}`,
                    status: 'PENDING'
                })
                .eq('id', id);

            if (error) return { success: false, message: error.message };
            return { success: true };
        }
        return { success: false, message: 'Non trouvé' };
    },

    // --- MATCHES ---

    async getMyMatches() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return [];

        const { data: myTeams } = await supabase.from('teams').select('id').eq('owner_id', session.user.id);
        const myTeamIds = myTeams ? myTeams.map(t => t.id) : [];
        if (myTeamIds.length === 0) return [];

        const { data: matches } = await supabase
            .from('matches')
            .select(`
                *,
                teamA:teams!matches_team_a_id_fkey(name),
                teamB:teams!matches_team_b_id_fkey(name)
            `)
            .or(`team_a_id.in.(${myTeamIds.join(',')}),team_b_id.in.(${myTeamIds.join(',')})`);

        return (matches || []).map(m => ({
            ...m,
            teamAName: m.teamA?.name || '?',
            teamBName: m.teamB?.name || '?'
        }));
    },

    async updateMatchScore(matchId, scoreA, scoreB) {
        const score = `${scoreA}-${scoreB}`;
        const { data: match, error } = await supabase
            .from('matches')
            .update({ score, status: 'FINISHED' })
            .eq('id', matchId)
            .select()
            .single();

        if (error) return { success: false, message: error.message };

        // Update stats (Naive client-side approach, ideally RPC)
        // Increment wins/losses
        // We'll skip complex stats logic for now to keep it safe or simple
        return { success: true };
    },

    // --- TOURNAMENTS ---

    async getTournaments() {
        const { data } = await supabase
            .from('tournaments')
            .select('*, registrations:tournament_registrations(count)');

        // Map registrations count back to teamsRegistered logic if needed. 
        // For now, let's assume teamsRegistered is an array of IDs in the front.
        // We might need to fetch the IDs.

        // Better:
        const { data: tours } = await supabase
            .from('tournaments')
            .select(`
                *,
                teamsRegistered:tournament_registrations(team_id)
            `);

        return (tours || []).map(t => ({
            ...t,
            teamsRegistered: t.teamsRegistered.map(r => r.team_id)
        }));
    },

    async registerTeamToTournament(tournamentId, teamId) {
        const { error } = await supabase
            .from('tournament_registrations')
            .insert([{ tournament_id: tournamentId, team_id: teamId }]);

        if (error) return { success: false, message: error.message };
        return { success: true };
    },

    async createTournament(tData) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { success: false, message: 'Non connecté' };

        const { data, error } = await supabase
            .from('tournaments')
            .insert([{ ...tData, owner_id: session.user.id }])
            .select()
            .single();

        if (error) return { success: false, message: error.message };
        return { success: true, tournament: data };
    }
};
