import styled from "styled-components";

const StyledSection = styled.fieldset`
    border: 1px solid #999;
    border-radius: 5px;
    padding: 15px;
    margin: 0 0 15px 0;
    display: grid;
    gap: 10px;

    legend {
        padding: 0 8px;
        font-weight: 600;
    }
    label {
        font-size: 13px;
    }
`;

const StyledSuccess = styled.div`
    background: #1a2a1f;
    border: 1px solid #2f6b3f;
    border-radius: 2px;
    padding: 12px 16px;
    margin-bottom: 24px;
    color: #7fd08f;
    font-size: 13px;
`;

export {
    StyledSection,
    StyledSuccess,
};
