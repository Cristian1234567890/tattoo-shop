const { supabase } = require("./utils");

module.exports = {
  async getUserSubscription(token, refresh, id) {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: refresh,
    });
    let { data, error } = await supabase
      .from("user_subscription")
      .select("*")
      .eq("id", id);
    if (error) return { success: false, error };
    return { success: true, data };
  },
  async insertUserSubscription(
    token,
    refresh,
    { id, product_id, subscription_id }
  ) {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: refresh,
    });

    const { data, error } = await supabase
      .from("user_subscription")
      .insert([{ id, product_id, subscription_id }])
      .select();

    if (error) return { success: false, error };
    return { success: true, data };
  },
};
