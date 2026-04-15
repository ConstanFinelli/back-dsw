import { Request, Response, NextFunction } from 'express';
import orm from '../shared/db/orm.js';
import { Pitch } from '../pitch/pitch.entities.js';
import { Reservation } from '../reservation/reservation.entities.js';
import { repository as pitchRepository } from '../pitch/pitch.repository.js';
import { repository as reservationRepository } from '../reservation/reservation.repository.js';
import { BusinessRepository } from '../business/business.repository.js';
import { AuthenticatedRequest } from './auth.middleware.js';
import { Roles } from '../constants/roles.js';

export function requireRoles(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthenticated' });
      return;
    }

    // Admin siempre puede
    if (req.user.category === Roles.ADMIN) return next();

    if (!allowedRoles.includes(req.user.category)) {
      res.status(403).json({ message: 'Access denied. Insufficient role' });
      return;
    }

    next();
  };
}

export async function verifyPitchOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthenticated' });
    return;
  }

  const id = Number(req.params.id || req.body.id);
  if (!id) {
    res.status(400).json({ message: 'Pitch id is required' });
    return;
  }

  try {
    // comprobar existencia y propiedad usando el repositorio (más reutilizable)
    const exists = await pitchRepository.findOne(id).catch(() => null);
    if (!exists) {
      res.status(404).json({ message: 'Pitch not found' });
      return;
    }

    if (req.user.category === Roles.ADMIN) {
      next();
      return;
    }

    const owned = await pitchRepository.isOwnedBy(id, req.user.id);
    if (owned) {
      next();
      return;
    }

    res.status(403).json({ message: 'Forbidden. Not pitch owner' });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    return;
  }
}

export async function verifyReservationOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthenticated' });
    return;
  }

  const id = Number(req.params.id || req.body.id);
  if (!id) {
    res.status(400).json({ message: 'Reservation id is required' });
    return;
  }

  try {
    // verificar existencia
    const exists = await reservationRepository.findOne(id).catch(() => null);
    if (!exists) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    if (req.user.category === Roles.ADMIN) {
      next();
      return;
    }

    const ownedByUser = await reservationRepository.isOwnedByUser(id, req.user.id);
    if (ownedByUser) {
      next();
      return;
    }

    const ownedByBusinessOwner = await reservationRepository.isOwnedByBusinessOwner(id, req.user.id);
    if (ownedByBusinessOwner) {
      next();
      return;
    }

    res.status(403).json({ message: 'Forbidden. Not reservation owner or pitch owner' });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    return;
  }
}

export async function verifyBusinessOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthenticated' });
    return;
  }

  const id = Number(req.params.id || req.body.id);
  if (!id) {
    res.status(400).json({ message: 'Business id is required' });
    return;
  }

  try {
    const repository = new BusinessRepository();
    const exists = await repository.findOne(id).catch(() => null);
    if (!exists) {
      res.status(404).json({ message: 'Business not found' });
      return;
    }

    if (req.user.category === Roles.ADMIN) {
      next();
      return;
    }

    const ownerId = Number(exists.owner?.id);
    if (ownerId && ownerId === req.user.id) {
      next();
      return;
    }

    res.status(403).json({ message: 'Forbidden. Not business owner' });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    return;
  }
}

export default {
  requireRoles,
  verifyPitchOwnership,
  verifyReservationOwnership,
  verifyBusinessOwnership,
};
