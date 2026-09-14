import { hashPassword, verifyPassword, DUMMY_HASH } from './security/password.js';
import { UsuariosRepository } from './repositories/usuarios.repository.js';
import { AuthService } from './services/auth.service.js';
import { UsuariosService } from './services/usuarios.service.js';
import { createClock } from './config/clock.js';
import { JugadoresRepository } from './repositories/jugadores.repository.js';
import { VideojuegosRepository } from './repositories/videojuegos.repository.js';
import { PuntuacionesRepository } from './repositories/puntuaciones.repository.js';
import { ClasificacionRepository } from './repositories/clasificacion.repository.js';
import { EstadisticasRepository } from './repositories/estadisticas.repository.js';
import { IdempotenciaRepository } from './repositories/idempotencia.repository.js';
import { JugadoresService } from './services/jugadores.service.js';
import { VideojuegosService } from './services/videojuegos.service.js';
import { PuntuacionesService } from './services/puntuaciones.service.js';
import { ClasificacionService } from './services/clasificacion.service.js';
import { EstadisticasService } from './services/estadisticas.service.js';
import { IdempotenciaService } from './services/idempotencia.service.js';
export function createContainer(database, config) {
  const clock = createClock(config.timeZone);
  const jugadores = new JugadoresRepository(database, clock);
  const videojuegos = new VideojuegosRepository(database, clock);
  const puntuaciones = new PuntuacionesRepository(database, clock);
  const usuarios = new UsuariosRepository(database);
  return {
    auth: new AuthService(usuarios, verifyPassword, DUMMY_HASH), usuarios: new UsuariosService(usuarios, hashPassword),
    jugadores: new JugadoresService(jugadores), videojuegos: new VideojuegosService(videojuegos),
    puntuaciones: new PuntuacionesService(puntuaciones, new IdempotenciaService(new IdempotenciaRepository(database))),
    clasificacion: new ClasificacionService(new ClasificacionRepository(database), videojuegos),
    estadisticas: new EstadisticasService(new EstadisticasRepository(database), videojuegos),
  };
}
