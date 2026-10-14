import type { ComputedLagPenalties, LagHardwareState, TargetLocation } from './multiplayerTypes.ts';

const BASE_DISTANCE_PENALTIES: Record<TargetLocation, { ref: number; intf: number }> = {
  EARTH: { ref: 0, intf: 0 },
  GEO_ORBIT: { ref: -1, intf: -1 },
  APEX_RING: { ref: -3, intf: -2 },
  LUNA: { ref: -4, intf: -2 },
  MARS: { ref: -20, intf: -10 },
};

export function calculateAuthoritativeLagPenalties(
  target: TargetLocation,
  hardware: LagHardwareState
): ComputedLagPenalties {
  const isDeepSpace = target !== 'EARTH';

  if (isDeepSpace && !hardware.hasTightbeamMaser && !hardware.completedOrbitalUplink) {
    return {
      refPenalty: 0,
      interfacePenalty: 0,
      canConnect: false,
      warningMessage:
        '> ERROR: ORBITAL UPLINK NODE OR TIGHTBEAM MASER ARRAY REQUIRED FOR OFF-WORLD ROUTING.',
    };
  }

  if (target === 'MARS' && hardware.isAldrinCyclerActive) {
    return {
      refPenalty: 0,
      interfacePenalty: 0,
      canConnect: true,
      warningMessage: '> ALDRIN CYCLER LOCK ESTABLISHED. LIGHT-LAG PENALTIES NEGATED.',
    };
  }

  let refPenalty = BASE_DISTANCE_PENALTIES[target].ref;
  let interfacePenalty = BASE_DISTANCE_PENALTIES[target].intf;

  if (hardware.hasLagSwitch) {
    if (hardware.lagToggleMode === 'space' && isDeepSpace) {
      refPenalty = 0;
      interfacePenalty = 0;
    } else if (hardware.lagToggleMode === 'space' && !isDeepSpace) {
      refPenalty = -4;
      interfacePenalty = -2;
    }
  }

  if (hardware.hasInitiativeBuffer && refPenalty < -2) {
    refPenalty = -2;
  }

  if (hardware.hasInterfaceBuffer && interfacePenalty < -2) {
    interfacePenalty = -2;
  }

  const warningMessage =
    refPenalty < 0 || interfacePenalty < 0
      ? `> WARNING: SEVERE LIGHT-LAG DETECTED (${refPenalty} REF, ${interfacePenalty} INTERFACE). INITIATIVE COMPROMISED.`
      : null;

  return {
    refPenalty,
    interfacePenalty,
    canConnect: true,
    warningMessage,
  };
}
