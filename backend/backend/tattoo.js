const { supabase } = require("./utils");

module.exports = {
  async getTattoPublicData(token, refresh) {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: refresh,
    });
    let { data, error } = await supabase.from("tatuadores_data").select("*");
    if (error) return { success: false, error };
    return { success: true, data };
  },
};
