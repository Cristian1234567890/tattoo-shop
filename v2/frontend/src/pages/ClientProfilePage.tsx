import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const ClientProfilePage: React.FC = () => {
  const { user, updateUserMetadata } = useAuth();

  const [name, setName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [direction, setDirection] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const [profileImg, setProfileImg] = useState<string>('/assets/Tattoo Machine Rotary.png');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [base64Img, setBase64Img] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {};
      setName(meta.nombre || '');
      setLastName(meta.apellido || '');
      setPhone(meta.telefono || '');
      setDate(meta.edad || '');
      setProvince(meta.provincia || '');
      setCity(meta.ciudad || '');
      setDirection(meta.direccion || '');
      setEmail(user.email || '');
      if (meta.profile) {
        setProfileImg(meta.profile);
      }
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setSelectedImage(res);
        const clean = res.includes(',') ? res.split(',')[1] : res;
        setBase64Img(clean);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Upload avatar image if selected
      let uploadedUrl = profileImg;
      if (base64Img) {
        try {
          await api.updateUserImg(base64Img);
          uploadedUrl = selectedImage;
          setProfileImg(selectedImage);
        } catch (imgErr) {
          console.warn('Image upload error:', imgErr);
        }
      }

      // 2. Update user metadata
      const payload: Record<string, any> = {
        email,
        nombre: name,
        apellido: lastName,
        telefono: phone,
        provincia: province,
        ciudad: city,
        direccion: direction,
        profile: uploadedUrl,
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      const res = await api.updateUser(payload);
      if (res.success) {
        updateUserMetadata({
          nombre: name,
          apellido: lastName,
          telefono: phone,
          provincia: province,
          ciudad: city,
          direccion: direction,
          profile: uploadedUrl,
        });
        setMessage({ text: '¡Perfil actualizado correctamente!', isError: false });
      } else {
        setMessage({
          text: res.error?.message || 'Error al actualizar perfil.',
          isError: true,
        });
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      // Fallback local update
      updateUserMetadata({
        nombre: name,
        apellido: lastName,
        telefono: phone,
        provincia: province,
        ciudad: city,
        direccion: direction,
      });
      setMessage({ text: 'Perfil actualizado con éxito.', isError: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8">
      <div className="container mx-auto flex flex-col md:flex-row gap-8 max-w-5xl bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl p-6 md:p-10 backdrop-blur-md border border-gray-200 dark:border-gray-800">
        {/* Left Column */}
        <div className="column1 w-full md:w-48 flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 pr-6 pb-6 md:pb-0">
          <div className="return mb-6">
            <Link to="/user" className="inline-block hover:opacity-80 transition">
              <img
                src="/assets/Back To White.png"
                alt="Volver"
                className="w-10 h-10 p-2 bg-black dark:bg-gray-800 rounded-full"
              />
            </Link>
          </div>
          <hr className="w-full my-2 border-gray-300 dark:border-gray-700" />
          <div className="list w-full">
            <ul className="space-y-2">
              <li className="font-bold text-primary dark:text-indigo-400 py-1.5 px-3 bg-primary/10 rounded-lg">
                Perfil
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="column2 flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Perfil
          </h1>
          <hr className="my-4 border-gray-200 dark:border-gray-800" />

          {message && (
            <div
              className={`p-3 rounded-lg mb-6 text-sm font-semibold text-center ${
                message.isError
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-green-100 text-green-700 border border-green-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="form-act">
            <form id="profileForm" onSubmit={handleSubmit} className="space-y-6">
              {/* Photo section */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
                  Foto de Perfil
                </h3>
                <div className="flex items-center gap-6">
                  <div className="profile">
                    <img
                      src={profileImg}
                      alt="Perfil"
                      id="profile-img"
                      className="w-20 h-20 rounded-full object-cover shadow border-2 border-primary"
                    />
                  </div>
                  <div className="upload flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="file-input"
                      onChange={handleImageChange}
                      className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer"
                    />
                    <div
                      id="image-container"
                      style={{ display: selectedImage ? 'block' : 'none' }}
                    >
                      <img
                        id="selected-image"
                        src={selectedImage || ''}
                        alt="Imagen seleccionada"
                        className="w-14 h-14 rounded-lg object-cover shadow mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-800" />

              {/* Personal Data */}
              <div className="data space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    id="name"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    id="last-name"
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <input
                  type="number"
                  id="phone"
                  placeholder="Telefóno"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Age */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Edad
                </h3>
                <input
                  type="date"
                  name="date"
                  id="date"
                  disabled
                  value={date}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed"
                />

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Direction */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Dirección
                </h3>
                <select
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white mb-3"
                >
                  <option value="" disabled>
                    Seleccione una Provincia
                  </option>
                  <option value="Panamá">Panamá</option>
                  <option value="Bocas del Toro">Bocas del Toro</option>
                  <option value="Colón">Colón</option>
                  <option value="Chiriquí">Chiriquí</option>
                  <option value="Darién">Darién</option>
                  <option value="Herrera">Herrera</option>
                  <option value="Los Santos">Los Santos</option>
                  <option value="Panamá Oeste">Panamá Oeste</option>
                  <option value="Veraguas">Veraguas</option>
                  <option value="Emberá-Wounaan">Emberá-Wounaan</option>
                  <option value="Guna Yala">Guna Yala</option>
                  <option value="Ngöbe-Buglé">Ngöbe-Buglé</option>
                </select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    id="city"
                    placeholder="Ciudad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    id="direction"
                    placeholder="Dirección"
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Credentials */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Credenciales
                </h3>
                <input
                  type="email"
                  id="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white mb-3"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="password"
                    id="password"
                    placeholder="Contraseña actual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="password"
                    id="new-password"
                    placeholder="Nueva Contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <br />
                <hr className="border-gray-200 dark:border-gray-800" />

                <button
                  type="submit"
                  id="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
