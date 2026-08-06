import styled, { css } from "styled-components";
import { BoxSizing, BreakPoint6, FlexBox, Grid } from "../Theme/mixins";

const FormContainer = styled.article`
    ${FlexBox()};
    ${BoxSizing()};
    justify-content: space-around;
    margin-bottom: 25px;
    padding: 25px;
    form {
        width: 60%;
        ${Grid('center')};
        grid-template-columns: .9fr;
        button {
            width: 50%;
            margin-top: 15px;
            justify-self: center;
        }
        ${BreakPoint6(css`
            width: 100%;
        `)};
    }
`;

const Input = styled.input`
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #999;
    border-radius: 5px;
    width: 100%;
`;

const StyledDivProducts = styled.div<{disabled?:boolean}>`
    width: 60%;
    justify-self: center;
    ${BoxSizing()};
    color: #fff;
    border: 2px #fff;
    border-radius: 7px;
    
`;

const StyledDivTotal = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 25px;
    ${BreakPoint6(css`
        flex-direction: column;
        p {
            padding-top: 10px;
        }
    `)};
`;

const StyledDivComplete = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-self: center;
    width: 60%;
    padding: 25px;
    button {
        margin: 25px;
    }
    ${BreakPoint6(css`
        flex-direction: column;
        p {
            padding-top: 10px;
        }
    `)};
`;

export {
    FormContainer,
    Input,
    StyledDivProducts,
    StyledDivTotal,
    StyledDivComplete
}