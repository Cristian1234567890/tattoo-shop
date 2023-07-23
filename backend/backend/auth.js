const { supabase } = require("./utils");
const { decode } = require("base64-arraybuffer");

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
      "https://unsftvudwxwbzwekokgr.supabase.co/storage/v1/object/sign/user_profile/tatto-default-profile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ1c2VyX3Byb2ZpbGUvdGF0dG8tZGVmYXVsdC1wcm9maWxlLnBuZyIsImlhdCI6MTY5MDE0OTk1OCwiZXhwIjoxNzIxNjg1OTU4fQ.v05WhR1PAzpz4O41-8Hv5igqunqolAhkwXpc2t2F6F8&t=2023-07-23T22%3A05%3A58.105Z";
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

    if (tipo === "Tatuador") {
      const data_to_insert = {
        nombre,
        apellido,
        work_type: "",
        telefono,
        provincia,
        ciudad,
        direccion,
        facebook: "",
        twitter: "",
        instagram: "",
        link: "",
        profile: default_profile_url,
      };
      const { error: error_insert } = await supabase
        .from("tatuadores_data")
        .insert({ id: data.user.id, data: data_to_insert });
      if (error) return { success: false, error_insert };
    }
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
  async updateUser(user_data, token, refresh) {
    const session = await supabase.auth.setSession({
      access_token: token,
      refresh_token: refresh,
    });

    const { data, error } = await supabase.auth.updateUser({
      data: user_data,
    });

    if (session.data.user.user_metadata.tipo === "Tatuador") {
      const { error: error_update } = await supabase
        .from("tatuadores_data")
        .update({ data: user_data })
        .eq("id", session.data.user.id);
      if (error) return { success: false, error_update };
    }

    if (error) return { success: false, error };
    return { success: true, data };
  },
  async updateUserImg({ imageData }, token, refresh) {
    const session = await supabase.auth.setSession({
      access_token: token,
      refresh_token: refresh,
    });

    const { data, error } = await supabase.storage
      .from("user_profile")
      .upload(`${session.data.user.id}/profile.png`, decode(imageData), {
        contentType: "image/png",
      });
    if (error) {
      if (error.error === "Duplicate") {
        const { data: data_update, error: error_update } =
          await supabase.storage
            .from("user_profile")
            .update(`${session.data.user.id}/profile.png`, decode(imageData), {
              contentType: "image/png",
            });
        if (error_update) console.log(error_update);
      }
    }

    const { data: data_url, error: error_url } = await supabase.storage
      .from("user_profile")
      .createSignedUrl(`${session.data.user.id}/profile.png`, 3.154e7);

    const { data: img_updated, error: error_updated } =
      await supabase.auth.updateUser({
        data: {
          profile: data_url.signedUrl,
        },
      });
    if (error_updated) return { success: false, error };
    return { success: true };
  },
};
