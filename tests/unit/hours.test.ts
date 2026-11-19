import { describe, expect, it } from 'vitest';
import { getOpenStatus, getPickupTimeSlots, timeToMinutes } from '@/lib/hours';
import { site } from '@/data/site';

describe('Opening hours helper (src/lib/hours.ts)', () => {
  it('converts HH:MM strings to minutes since midnight', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('13:00')).toBe(780);
    expect(timeToMinutes('18:30')).toBe(1110);
    expect(timeToMinutes('22:00')).toBe(1320);
  });

  it('reports open on Tuesday at 19:30 and closed at 22:00', () => {
    // 2026-11-17 is a Tuesday
    const tuesdayOpen = new Date('2026-11-17T19:30:00Z');
    const statusOpen = getOpenStatus(tuesdayOpen, site.hours, true);
    expect(statusOpen.isOpen).toBe(true);
    expect(statusOpen.currentInterval?.open).toBe('18:00');
    expect(statusOpen.currentInterval?.close).toBe('22:00');

    const tuesdayClose = new Date('2026-11-17T22:00:00Z');
    const statusClosed = getOpenStatus(tuesdayClose, site.hours, true);
    expect(statusClosed.isOpen).toBe(false);
    expect(statusClosed.nextOpening?.day).toBe('Wednesday');
    expect(statusClosed.nextOpening?.open).toBe('18:00');
  });

  it('handles Friday split shift (13:00-15:00 and 18:00-22:00)', () => {
    // 2026-11-20 is a Friday
    const friMorning = new Date('2026-11-20T11:00:00Z');
    const statusMorning = getOpenStatus(friMorning, site.hours, true);
    expect(statusMorning.isOpen).toBe(false);
    expect(statusMorning.nextOpening?.isToday).toBe(true);
    expect(statusMorning.nextOpening?.open).toBe('13:00');

    const friLunch = new Date('2026-11-20T14:00:00Z');
    expect(getOpenStatus(friLunch, site.hours, true).isOpen).toBe(true);

    const friAfternoonBreak = new Date('2026-11-20T16:15:00Z');
    const statusBreak = getOpenStatus(friAfternoonBreak, site.hours, true);
    expect(statusBreak.isOpen).toBe(false);
    expect(statusBreak.nextOpening?.isToday).toBe(true);
    expect(statusBreak.nextOpening?.open).toBe('18:00');

    const friDinner = new Date('2026-11-20T20:45:00Z');
    expect(getOpenStatus(friDinner, site.hours, true).isOpen).toBe(true);
  });

  it('generates 15-minute pickup slots within opening hours', () => {
    // Tuesday (18:00 - 22:00 -> first pickup 18:15, last 22:00)
    const tuesday = new Date('2026-11-17T12:00:00Z');
    const slots = getPickupTimeSlots(tuesday, site.hours, true);
    expect(slots[0]).toBe('18:15');
    expect(slots[slots.length - 1]).toBe('22:00');
    expect(slots).toContain('20:30');
  });
});
