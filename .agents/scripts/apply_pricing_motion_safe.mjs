import fs from 'fs';
import path from 'path';

const pricingPath = path.resolve('v2/frontend/src/pages/PricingPage.tsx');
let content = fs.readFileSync(pricingPath, 'utf8');

const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// Add import if not present
if (!norm.includes("from 'framer-motion'")) {
  norm = "import { motion } from 'framer-motion';\n" + norm;
}

// Replace Card 1
const oldCard1Open = '            {/* 1. Explorador */}\n            <div className="atelier-card p-8 rounded-3xl flex flex-col justify-between">';
const newCard1Open = `            {/* 1. Explorador */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="atelier-card p-8 rounded-3xl flex flex-col justify-between"
            >`;

// Card 1 Close
const oldCard1Close = `              )}
            </div>

            {/* 2. Coleccionista VIP */}`;
const newCard1Close = `              )}
            </motion.div>

            {/* 2. Coleccionista VIP */}`;

// Card 2 Open
const oldCard2Open = '            {/* 2. Coleccionista VIP */}\n            <div className="atelier-card p-8 rounded-3xl flex flex-col justify-between">';
const newCard2Open = `            {/* 2. Coleccionista VIP */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
              className="atelier-card p-8 rounded-3xl flex flex-col justify-between"
            >`;

// Card 2 Close
const oldCard2Close = `              </Link>
            </div>

            {/* 3. Estudio Profesional */}`;
const newCard2Close = `              </Link>
            </motion.div>

            {/* 3. Estudio Profesional */}`;

// Card 3 Open
const oldCard3Open = '            {/* 3. Estudio Profesional */}\n            <div className="atelier-card border-2 border-violet-600 p-8 rounded-3xl flex flex-col justify-between relative shadow-[0_0_40px_rgba(124,58,237,0.25)]">';
const newCard3Open = `            {/* 3. Estudio Profesional */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.16 }}
              className="atelier-card border-2 border-violet-600 p-8 rounded-3xl flex flex-col justify-between relative shadow-[0_0_40px_rgba(124,58,237,0.25)]"
            >`;

// Card 3 Close
const oldCard3Close = `              </Link>
            </div>
          </div>

          {/* Feature Comparison Matrix */}`;
const newCard3Close = `              </Link>
            </motion.div>
          </div>

          {/* Feature Comparison Matrix */}`;

const replacements = [
  [oldCard1Open, newCard1Open],
  [oldCard1Close, newCard1Close],
  [oldCard2Open, newCard2Open],
  [oldCard2Close, newCard2Close],
  [oldCard3Open, newCard3Open],
  [oldCard3Close, newCard3Close],
];

let replaced = 0;
for (const [oldS, newS] of replacements) {
  if (norm.includes(oldS)) {
    norm = norm.replace(oldS, newS);
    replaced++;
  } else {
    console.warn('Target not found in PricingPage:', oldS.slice(0, 40));
  }
}

if (isCRLF) {
  norm = norm.replace(/\n/g, '\r\n');
}

fs.writeFileSync(pricingPath, norm, 'utf8');
console.log(`Replaced ${replaced} of ${replacements.length} blocks in PricingPage.tsx`);
