const { supabase } = require("./utils");

module.exports = {
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) return { success: false, error };

    return { success: true, data: data };
  },
  async signUp({ email, password, nombre, apellido, edad, tipo }) {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          nombre,
          apellido,
          edad,
          tipo,
        },
      },
    });

    if (error) return { success: false, error };
    return { success: true, data: data };
  },
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error };
    return { success: true };
  },
  async enroll2FA(token, refresh) {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: refresh,
    });
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });
    if (error) return { success: false, error };
    return { success: true, data };
  },
  async verify2FA({ factorId, code }, token, refresh) {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: refresh,
    });
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });
    if (error) return { success: false, error };
    return { success: true, data };
  },
};
