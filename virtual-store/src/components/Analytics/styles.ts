import styled, { css } from 'styled-components';
import { BoxSizing, BreakPoint6 } from '../Theme/mixins';

/**
 * Chart colors (dark surface). Validated with the dataviz palette checker against
 * #252433: CVD ΔE 26.8, contrast ≥ 3:1. Color follows the channel, never its rank.
 */
export const SERIES = {
    online: '#3987e5',
    pos: '#d95926',
};

export const SURFACE = '#252433';
export const GRID = '#3a3948';
export const TEXT_MUTED = '#b4b2c4';

const StyledDashboard = styled.section`
    ${BoxSizing()};
    width: 90%;
    max-width: 1200px;
    margin: 0 auto 40px;
    padding: 25px;
    color: #f0efec;
    display: grid;
    gap: 20px;
    h2, h3 { margin: 0; }
    h3 { font-size: 1rem; font-weight: 600; }
    .muted { color: ${TEXT_MUTED}; font-size: 13px; margin: 0; }
    ${BreakPoint6(css`
        width: 100%;
        padding: 12px;
    `)};
`;

const StyledFilters = styled.form`
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    align-items: end;
    label {
        display: grid;
        gap: 4px;
        font-size: 12px;
        color: ${TEXT_MUTED};
    }
    input, select {
        padding: 7px 9px;
        border: 1px solid #555;
        border-radius: 5px;
        background: #1b1b24;
        color: #f0efec;
        font: inherit;
        font-size: 14px;
    }
`;

const StyledPresets = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    button {
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid #555;
        background: transparent;
        color: #f0efec;
        cursor: pointer;
        font-size: 13px;
    }
    button[aria-pressed='true'] {
        background: ${SERIES.online};
        border-color: ${SERIES.online};
    }
`;

const StyledCard = styled.div`
    ${BoxSizing()};
    background: ${SURFACE};
    border-radius: 8px;
    padding: 16px 18px;
    display: grid;
    gap: 12px;
    align-content: start;
    min-width: 0;
`;

const StyledKpis = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
`;

const StyledKpi = styled(StyledCard)`
    gap: 4px;
    .label { font-size: 13px; color: ${TEXT_MUTED}; }
    .value { font-size: 1.5rem; font-weight: 600; }
    .delta { font-size: 12px; color: ${TEXT_MUTED}; }
    .up { color: #6fd08c; }
    .down { color: #ef8a8a; }
`;

const StyledGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 16px;
    ${BreakPoint6(css`
        grid-template-columns: 1fr;
    `)};
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    th, td {
        padding: 6px 8px;
        border-bottom: 1px solid ${GRID};
        text-align: left;
    }
    th { color: ${TEXT_MUTED}; font-weight: 500; font-size: 12px; }
    .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    tfoot td { font-weight: 600; border-bottom: none; }
`;

const StyledHeaderRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    .muted { color: ${TEXT_MUTED}; font-size: 13px; }
    button, select {
        background: transparent;
        color: #f0efec;
        border: 1px solid #555;
        border-radius: 5px;
        padding: 4px 9px;
        font: inherit;
        font-size: 13px;
        cursor: pointer;
    }
`;

const StyledLegend = styled.ul`
    display: flex;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 13px;
    li { display: flex; align-items: center; gap: 6px; }
    span.swatch { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
`;

const StyledChart = styled.div`
    position: relative;
    svg { display: block; width: 100%; height: auto; overflow: visible; }
    text { fill: ${TEXT_MUTED}; font-size: 11px; }
`;

const StyledTooltip = styled.div`
    position: absolute;
    top: 0;
    pointer-events: none;
    background: #111018;
    border: 1px solid #444;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 12px;
    min-width: 160px;
    transform: translateX(-50%);
    z-index: 2;
    strong { display: block; margin-bottom: 4px; }
    div { display: flex; justify-content: space-between; gap: 12px; }
    span.key { display: inline-flex; align-items: center; gap: 6px; }
    span.swatch { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
`;

/** Thin horizontal bar used inside ranking tables. */
const StyledBar = styled.span<{ $ratio: number }>`
    display: block;
    height: 6px;
    margin-top: 4px;
    border-radius: 0 3px 3px 0;
    background: ${SERIES.online};
    width: ${({ $ratio }) => Math.max(1, Math.round($ratio * 100))}%;
`;

const StyledBacklog = styled.dl`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 0;
    div { background: #1b1b24; border-radius: 6px; padding: 10px; }
    dt { font-size: 12px; color: ${TEXT_MUTED}; }
    dd { margin: 4px 0 0; font-size: 1.3rem; font-weight: 600; }
    ${BreakPoint6(css`
        grid-template-columns: 1fr;
    `)};
`;

export {
    StyledBacklog,
    StyledBar,
    StyledCard,
    StyledChart,
    StyledDashboard,
    StyledFilters,
    StyledGrid,
    StyledHeaderRow,
    StyledKpi,
    StyledKpis,
    StyledLegend,
    StyledPresets,
    StyledTable,
    StyledTooltip,
};
