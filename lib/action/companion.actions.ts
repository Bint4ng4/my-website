'use server';

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { companionFormSchema } from "@/lib/action/companion.schema";



//implementation aplication logic
export const createCompanion = async (formData: CreateCompanion) => {
    const {userId: author } = await auth();
    if (!author) throw new Error('Unauthorized');

    const parsed = companionFormSchema.safeParse(formData);
    if (!parsed.success) {
        throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
    }
    const { name, subject, topic, voice, style, duration } = parsed.data;
    const supabase = createSupabaseClient();

    const { data,error } = await supabase
    .from('companions')
    .insert({ name, subject, topic, voice, style, duration, author })
    .select();

    if (error || !data) 
        throw new Error(error?.message || 'Failed to create companion');

    return data[0];
}
// PostgREST ilike patterns treat % and _ as wildcards: escape them so user
// input cannot inject pattern metacharacters.
const escapeLikePattern = (value: string) =>
    value.replace(/([%_\\])/g, "\\$1");

// Inside a PostgREST .or() logic expression, , ( ) " . : are expression
// syntax. Double-quoting the value (embedded quotes doubled) keeps user
// input a single literal value instead of extra filter conditions.
const quoteOrValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

const toSafeInt = (value: number | undefined, fallback: number, max: number) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
    return Math.min(Math.max(Math.floor(value), 1), max);
};

//u/ limitasi
export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {
    try {
        const supabase = createSupabaseClient();
        let query = supabase.from('companions').select();

        const safeLimit = toSafeInt(limit, 10, 100);
        const safePage = toSafeInt(page, 1, 10000);

        if (typeof subject === 'string' && typeof topic === 'string' && subject && topic) {
            query = query.ilike('subject', `%${escapeLikePattern(subject)}%`)
                         .or(`topic.ilike.${quoteOrValue(`%${escapeLikePattern(topic)}%`)},name.ilike.${quoteOrValue(`%${escapeLikePattern(topic)}%`)}`)
        } else if (typeof subject === 'string' && subject) {
            query = query.ilike('subject', `%${escapeLikePattern(subject)}%`)
        } else if (typeof topic === 'string' && topic) {
            query = query.or(`topic.ilike.${quoteOrValue(`%${escapeLikePattern(topic)}%`)},name.ilike.${quoteOrValue(`%${escapeLikePattern(topic)}%`)}`)
        }

        query = query.range((safePage - 1) * safeLimit, safePage * safeLimit - 1);

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
    if (!userId) throw new Error('Unauthorized');
    if (typeof companionid !== 'string' || companionid.length === 0 || companionid.length > 128) {
        throw new Error('Invalid companion id');
    }

    const supabase = createSupabaseClient();

    const { data: companion } = await supabase
        .from('companions')
        .select('id')
        .eq('id', companionid)
        .maybeSingle();

    if (!companion) throw new Error('Companion not found');

    const {data, error} = await supabase.from('session_history').insert({
        companion_id: companionid,
        user_id : userId,
    })

    if (error) throw new Error(error.message);

    return data;
}

export const getRecentSession = async (limit = 10) => {
    const supabase = createSupabaseClient();
    const safeLimit = toSafeInt(limit, 10, 100);
    const { data: sessions, error } = await supabase
        .rpc('get_recent_unique_sessions', { p_limit: safeLimit });

    if (error) throw new Error(error.message);
    if (!sessions?.length) return [];

    const { data: companions, error: companionsError } = await supabase
        .from('companions')
        .select('*')
        .in('id', sessions.map((s: { companion_id: string }) => s.companion_id));

    if (companionsError) throw new Error(companionsError.message);

    return sessions
        .map((s: { companion_id: string }) => companions?.find(c => c.id === s.companion_id))
        .filter(Boolean);
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