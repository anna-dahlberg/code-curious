import { supabase } from '../supabaseClient';

export const fetchTotalLessons = async () => {
    const { data, error } = await supabase
        .from('lessons')
        .select('id');
        
    if (error) {
        console.error('Error fetching lessons:', error);
        return 0;
    }
    
    return data?.length || 0;
};