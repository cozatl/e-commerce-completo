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

const Button = styled.button`
    padding: 10px;
    box-sizing: border-box;
    background-color: darkblue;
    color: #fff;
    border: none;
    border-radius: 7px;
    cursor: pointer;
`;

export {
    FormContainer,
    Input,
    Button
}