import supabase from "../config/supabase.js";

const PAGE = 1000;

/**
 * Fetches all rows from a Supabase table, paginating in batches of 1000
 * because PostgREST enforces a hard server-side max of 1000 rows per request.
 * @param {() => import("@supabase/supabase-js").PostgrestFilterBuilder} buildQuery
 */
export async function fetchAll(buildQuery) {
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await buildQuery().range(from, from + PAGE - 1);
    if (error) throw error;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}
