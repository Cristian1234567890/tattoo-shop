const fs = require('fs');
let regStr = fs.readFileSync('v2/frontend/src/pages/RegisterPage.tsx', 'utf8');
regStr = regStr.replace(/edad: 18, \/\/ Defaulting or can add field\s+onboardingData: \{\s+phone,\s+country,\s+address: tipo === 'Tatuador' \? address : undefined,\s+city: tipo === 'Tatuador' \? city : undefined,\s+postalCode: tipo === 'Tatuador' \? postalCode : undefined\s+\}/g,
  edad: '18',\n        telefono: phone,\n        provincia: country,\n        ciudad: city,\n        direccion: address);
regStr = regStr.replace(/if \(response\.user\) \{\s+\/\/ Log them in immediately\s+await login\(email, password\);/g,
  if (response.success && response.data) {\n        // Log them in immediately\n        await login({ user: response.data.user, session: response.data.session }););
fs.writeFileSync('v2/frontend/src/pages/RegisterPage.tsx', regStr);
