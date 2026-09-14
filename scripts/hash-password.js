import { hashPassword } from '../src/security/password.js';
import { emitKeypressEvents } from 'node:readline';
if (!process.stdin.isTTY) {
  console.error('Ejecuta este comando en una terminal interactiva.'); process.exitCode = 1;
} else {
  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdout.write('Contraseña nueva de la API (mínimo 15 caracteres; entrada oculta): ');
  let password = '';
  const listener = async (str, key = {}) => {
    if (key.ctrl && key.name === 'c') { process.stdin.setRawMode(false); process.exit(130); }
    if (key.name === 'backspace') { password = [...password].slice(0, -1).join(''); return; }
    if (key.name === 'return') {
      process.stdin.off('keypress', listener); process.stdin.setRawMode(false); process.stdin.pause();
      process.stdout.write('\n');
      if (password.length < 15 || password.length > 512) { console.error('Utiliza entre 15 y 512 caracteres.'); process.exitCode = 1; return; }
      try { console.log(`PASSWORD_HASH=${await hashPassword(password)}`); }
      catch { console.error('No se pudo generar el hash.'); process.exitCode = 1; }
      return;
    }
    if (str && !key.ctrl && !key.meta && !/[\u0000-\u001f\u007f]/.test(str) && password.length < 513) password += str;
  };
  process.stdin.on('keypress', listener);
}
