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
  async signUp({
    email,
    password,
    nombre,
    apellido,
    edad,
    tipo,
    telefono = "",
    provincia = "",
    ciudad = "",
    direccion = "",
  }) {
    const default_profile_url =
      "https://unsftvudwxwbzwekokgr.supabase.co/storage/v1/object/sign/user_profile/tatto-default-profile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ1c2VyX3Byb2ZpbGUvdGF0dG8tZGVmYXVsdC1wcm9maWxlLnBuZyIsImlhdCI6MTY5MDEyODIzNCwiZXhwIjoxNzIxNjY0MjM0fQ.wh7jLsaNgGYy99Qv2EMUIIIZDyq8eKav1qXiTROVUI8&t=2023-07-23T16%3A03%3A54.320Z";
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          nombre,
          apellido,
          edad,
          tipo,
          telefono,
          provincia,
          ciudad,
          direccion,
          profile: default_profile_url,
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
  async updateUser(
    {
      nombre,
      apellido,
      edad,
      tipo,
      telefono = "",
      provincia = "",
      ciudad = "",
      direccion = "",
      profile_photo = null,
    },
    token,
    refresh
  ) {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: refresh,
    });

    const { data, error } = await supabase.auth.updateUser({
      data: {
        nombre,
        apellido,
        edad,
        tipo,
        telefono,
        provincia,
        ciudad,
        direccion,
      },
    });
    if (error) return { success: false, error };
    return { success: true, data };
  },
};
