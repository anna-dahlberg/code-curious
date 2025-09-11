import { supabase } from '../supabaseClient';

// Use Supabase client to fetch data from countries table
export const fetchLessonId = async (lessonId: string) => {
    const { data, error } = await supabase
        .from('lessons')
        .select('id')
        .eq('slug', lessonId)
        .single();
    if (error) {
        console.error('Error fetching data', error);
    }
    return data?.id;
};
