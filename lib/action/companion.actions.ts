'use server';

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";



//implementation aplication logic
export const createCompanion = async (formData: CreateCompanion) => {
    const {userId: author } = await auth();
    const supabase = createSupabaseClient();

    const { data,error } = await supabase
    .from('companions')
    .insert({...formData, author})
    .select();

    if (error || !data) 
        throw new Error(error?.message || 'Failed to create companion');

    return data[0];
}
//u/ limitasi
export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {
    try {
        const supabase = createSupabaseClient();
        let query = supabase.from('companions').select();

        if (subject && topic) {
            query = query.ilike('subject', `%${subject}%`)
                         .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
        } else if (subject) {
            query = query.ilike('subject', `%${subject}%`)
        } else if (topic) {
            query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
        }

        query = query.range((page - 1) * limit, page * limit - 1);

        const { data: companions, error } = await query;
        
        // Cek error secara spesifik
        if (error) {
            console.error("Supabase Error:", error.message);
            return []; // Kembalikan array kosong daripada throw error agar UI tidak mati
        }
    
        return companions;
    } catch (err) {
        console.error("Unexpected Error:", err);
        return [];
    }
}

export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.from('companions').select().eq('id', id);

    if (error) return console.log(error);

    return data[0];
}

export const addToSessionHistory = async (companionid: string) => {
    const {userId} = await auth();
    const supabase = createSupabaseClient();
    const {data, error} = await supabase.from('session_history').insert({
        companion_id: companionid,
        user_id : userId,
    })

    return data;
}

export const getRecentSession = async (limit = 10) => {
    const supabase = createSupabaseClient();
    const{ data, error} = await supabase
    .from('recent_unique_sessions')
    .select('companions:companion_id(*)')
    .order('created_at', {ascending: false})
    .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
    
}

    export const getUserSession = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
        .from('session_history')
        .select('companions:companion_id(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }); // Ambil semua dulu untuk difilter

    if (error) throw new Error(`Supabase Error: ${error.message}`);
    if (!data) return [];

    // Gunakan Map untuk de-duplikasi berdasarkan ID unik companion
    const uniqueCompanions = Array.from(
        new Map(
            data
                .map(item => item.companions)
                .filter((c): c is Companion => c !== null) 
                .map(c => [c.id, c])
        ).values()
    );

    return uniqueCompanions.slice(0, limit);
};

export const getUserCompanion = async (userId: string) => {
    const supabase = createSupabaseClient();
    const{ data, error} = await supabase
    .from('companions')
    .select('')
    .eq('author', userId)
  

    if(error) throw new Error(error.message);

    return data;
}

//logika 1 dari tutorial
export const newCompanionPermission = async () => {
    const{ userId, has} = await auth();
    const supabase = createSupabaseClient();
    
    let limit = 0;

    if(has({ plan: 'pro'})) {
        return true;
    }else if (has( {feature: "3_companion_limit"})){
        limit = 3;
    }
    else if (has( {feature: "10_companion_limit"})){
        limit = 10;
    }
  
    const { data,error} = await supabase
    .from('companions')
    .select('id',{count: 'exact'})
    .eq('author',userId)

    if(error) throw new Error(error.message);

    const companionCount = data?.length;

    if(companionCount >= limit){
        return false
    } else {
        return true;
    }

}
// //logike ke 2 dari ai
// export const newCompanionPermission = async () => {
//     const { userId, has } = await auth();
//     const supabase = createSupabaseClient();
    
//     // 1. Bypass untuk Pro
//     if (has({ plan: 'pro' })) return true;

//     // 2. Tentukan Limit (Gunakan default limit untuk user gratis, misal: 1)
//     let limit = 1; 
//     if (has({ feature: "3_companion_limit" })) limit = 3;
//     if (has({ feature: "10_companion_limit" })) limit = 10;
  
//     // 3. Gunakan count: 'exact' dengan benar
//     const { count, error } = await supabase
//         .from('companions')
//         .select('*', { count: 'exact', head: true }) // head: true agar tidak download datanya, cuma hitung
//         .eq('author', userId);

//     if (error) throw new Error(error.message);

//     const companionCount = count ?? 0;

//     // 4. Logika: Jika jumlah saat ini sudah >= limit, maka TIDAK boleh buat baru
//     return companionCount < limit;
// }