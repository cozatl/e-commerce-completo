import type { ChangeEvent } from 'react';
import type { ReportFilters, ReportMeta } from '../interfaces/analyticsParameters';
import { PRESETS } from './analyticsUtils';
import { StyledFilters, StyledPresets } from './styles';

interface FiltersProps {
    meta: ReportMeta;
    filters: ReportFilters;
    onChange: (changes: Partial<ReportFilters>) => void;
}

/** One row of controls above every chart. Values live in the URL (shareable). */
const Filters = ({ meta, filters, onChange }: FiltersProps) => {
    const today = meta.defaults.end;
    const start = filters.start || meta.defaults.start;
    const end = filters.end || meta.defaults.end;
    const active = PRESETS.find((p) => {
        const r = p.range(today);
        return r.start === start && r.end === end;
    });

    const set = (key: keyof ReportFilters) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        onChange({ [key]: event.target.value });

    // Branch filter only makes sense with more than one visible branch; seller filter
    // only when the viewer can see more than themselves.
    const showLocations = meta.locations.length > 1;
    const showSellers = meta.sellers.length > 1;

    return (
        <StyledFilters onSubmit={(e) => e.preventDefault()} aria-label='Filtros de reportes'>
            <StyledPresets role='group' aria-label='Periodo'>
                {PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        type='button'
                        aria-pressed={active?.id === preset.id}
                        onClick={() => onChange({ ...preset.range(today), interval: '' })}
                    >
                        {preset.label}
                    </button>
                ))}
            </StyledPresets>
            <label>
                Desde
                <input type='date' value={start} max={end} onChange={set('start')} />
            </label>
            <label>
                Hasta
                <input type='date' value={end} min={start} max={today} onChange={set('end')} />
            </label>
            <label>
                Canal
                <select value={filters.channel} onChange={set('channel')}>
                    <option value=''>Todos</option>
                    {meta.channels.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
            </label>
            {showLocations && (
                <label>
                    Sucursal
                    <select value={filters.location} onChange={set('location')}>
                        <option value=''>Todas</option>
                        {meta.locations.map((loc) => (
                            <option key={loc.id} value={String(loc.id)}>
                                {loc.kind === 'warehouse' ? loc.name : `${loc.name} · ${loc.region}`}
                                {loc.is_active ? '' : ' (inactiva)'}
                            </option>
                        ))}
                    </select>
                </label>
            )}
            {showSellers && (
                <label>
                    Vendedor
                    <select value={filters.seller} onChange={set('seller')}>
                        <option value=''>Todos</option>
                        {meta.sellers.map((s) => (
                            <option key={s.id} value={String(s.id)}>{s.name}</option>
                        ))}
                    </select>
                </label>
            )}
        </StyledFilters>
    );
};

export default Filters;
