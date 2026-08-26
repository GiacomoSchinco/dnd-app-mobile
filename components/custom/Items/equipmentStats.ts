import type { ItemDefinition } from '../../../types';
import { getWeaponProperties, getArmorProperties } from '../../../lib/rules/items';
import { TYPE_COLORS } from './types';

/** Formatta la CA delle armature ({ base, type } o numero) */
function formatAc(ac: unknown): string {
  if (ac && typeof ac === 'object') {
    const o = ac as { base?: number; type?: string };
    const base = o.base ?? 0;
    return o.type === 'dex' ? `${base} + DES` : String(base);
  }
  return String(ac ?? '—');
}

/** Formatta la gittata di un'arma ({ normal, long } o numero) */
function formatRange(r: unknown): string {
  if (r && typeof r === 'object') {
    const o = r as { normal?: number; long?: number };
    if (o.normal != null && o.long != null) return `${o.normal} m / ${o.long} m`;
    if (o.normal != null) return `${o.normal} m`;
  }
  return String(r ?? '—');
}

export type EquipmentStatsSummary = { label: string; color: string };

/**
 * Riepilogo compatto delle statistiche di un oggetto (per righe di equipaggio).
 * Restituisce null per gli oggetti senza proprietà di combattimento (es. gear).
 * `modifier` = modificatore di danno del PG (aggiunto ai dadi delle armi).
 */
export function getEquipmentStatsSummary(item: ItemDefinition, modifier?: number | null): EquipmentStatsSummary | null {
  if (item.type === 'weapon') {
    const w = getWeaponProperties(item);
    if (!w) return null;
    const parts: string[] = [];
    if (w.damage) {
      const m = modifier ?? 0;
      const sign = m > 0 ? ` +${m}` : m < 0 ? ` −${Math.abs(m)}` : '';
      parts.push(`${w.damage}${sign}${w.damageType ? ` ${w.damageType}` : ''}`);
    }
    if (w.versatileDamage) parts.push(`2 mani ${w.versatileDamage}`);
    if (w.range) parts.push(formatRange(w.range));
    if (w.magicBonus != null) parts.push(`+${w.magicBonus} magico`);
    if (w.properties && w.properties.length > 0) parts.push(w.properties.join(', '));
    if (parts.length === 0) return null;
    return { label: parts.join(' · '), color: TYPE_COLORS.weapon };
  }

  if (item.type === 'armor') {
    const a = getArmorProperties(item);
    if (!a) return null;
    const parts: string[] = [];
    if (a.ac) parts.push(`CA ${formatAc(a.ac)}`);
    if (a.armorType) parts.push(a.armorType);
    if (a.strength != null) parts.push(`FOR ${a.strength}`);
    if (a.stealth === 'svantaggio') parts.push('Svantaggio furtività');
    if (parts.length === 0) return null;
    return { label: parts.join(' · '), color: TYPE_COLORS.armor };
  }

  return null;
}
