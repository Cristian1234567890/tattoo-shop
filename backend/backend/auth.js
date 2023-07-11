const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(process.env.SUPABASEURL, process.env.SUPABASEKEY);

module.exports = {
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.log(error);
      return { success: false, error: error };
    }
    return { success: true, data: data };
  },
};
