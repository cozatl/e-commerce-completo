import styled, { css } from "styled-components";
import { BreakPoint1 } from "../Theme/mixins";

// interface LogItemProps {
//   status: string
// };

const StyledInput = css`
    /* needs to be relative so the :focus span is positioned correctly */
	position:relative;
	/* the border gradient */
	border-image: linear-gradient(to right, #3acfd5 0%, #3a4ed5 100%) 1;
	/* the width of the input border */
	padding: 3px;	
	/* we want inline fields by default */
	display: inline-block;	
	/* we want rounded corners no matter the size of the field */
	border-radius: 9999em;	
	/* style of the actual input field */
	*:not(span) {
		position: relative;
		display: inherit;
		border-radius: inherit;
		margin: 0;
		border: none;
		outline: none;
		padding: 0 .325em;
		z-index: 1; /* needs to be above the :focus span */		
		/* summon fancy shadow styles when focussed */
		&:focus + span {
			opacity: 1;
			transform: scale(1);
		}
	};
  
	/* we don't animate box-shadow directly as that can't be done on the GPU, only animate opacity and transform for high performance animations. */
	span {
		
		transform: scale(.993, .94); /* scale it down just a little bit */
		transition: transform .5s, opacity .25s;
		opacity: 0; /* is hidden by default */
		
		position:absolute;
		z-index: 0; /* needs to be below the field (would block input otherwise) */
		margin:4px; /* a bit bigger than .input padding, this prevents background color pixels shining through */
		left:0;
		top:0;
		right:0;
		bottom:0;
		border-radius: inherit;
		pointer-events: none; /* this allows the user to click through this element, as the shadow is rather wide it might overlap with other fields and we don't want to block those. */
		
		/* fancy shadow styles */
		box-shadow: inset 0 0 0 3px #fff,
			0 0 0 4px #fff,
			3px -3px 30px #1beabd, 
			-3px 3px 30px #1c4c66;
	};
  >input,select {
      font-family: inherit;
      line-height:inherit;
      color:#2e3750;
      min-width:12em;
      /* the border gradient */
      border-image: linear-gradient(to right, #3acfd5 0%, #3a4ed5 100%) 1;
  };
  ::placeholder {
	color:#5a7086;
  ${BreakPoint1(css`
              color:#2e3750;
              min-width:17em;
              /* the border gradient */
              border-image: linear-gradient(to right, #3acfd5 0%, #3a4ed5 100%) 1;
          `)};
}
`;

const StyledButton = styled.button<{disabled?:boolean, loading?:boolean}>`
    color: ${({disabled, theme}) => 
      disabled ? theme.colors.bgBtnDisabledColor : 'gray'
    };

    background: ${({loading, theme}) => 
      loading ? '#2a2d3a' : '#4a7fa5'
    };
    transition: background 0.2s;

    cursor: ${({loading, theme}) => 
      loading ? 'not-allowed' : 'pointer'
    };

    position: relative;
    padding: 8px 15px;
    font: 15px "Orbitron"; 
    text-transform: uppercase;
    margin: 15px 20px;
    color: rgb(250, 228, 199);
    text-shadow: 1px 2px 1px rgba(255, 255, 255, 0.25);
    background-image: radial-gradient( /* It affects low shadow color on the button */
      100% 75% at 50% 100%,
      #1c4142 0%,
      #008dc4 100%
    );
    border: none;
    border-radius: 10px;
    box-shadow: inset 0 1px 10px 0 rgb(49, 65, 90), /* Main color shadow and background color on the button */
      inset 0 -3px 0 0 rgb(98, 197, 254),
      inset 0 20px 0 0 rgba(6, 8, 15, 0.4),
      inset 0 20px 5px 0 rgb(65, 69, 107),
      0 0 0 1px #021d33, /* Button border */
      0 5px 0 0 #444,
      0 0 20px 0 rgba(98, 236, 254, 0.4),
      0 40px 20px -30px rgba(98, 254, 254, 0.2);
  
    &:before { /* Main shadow */
      content: "";
      position: absolute;
      z-index: -2;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      background: linear-gradient(#056a83, #056a83);
      border-radius: 100px;
      box-shadow: 0 2px 5px #000, 
        inset 0 10px 0 #056a83;
    }
    
    &:after { /* Line shadow */
      content: "";
      position: absolute;
      z-index: -1;
      background: #104386;
      box-shadow: 0 1px 0 #444;
      height: 10px;
      left: -10px;
      right: -10px;
      top: 50%;
      transform: translateY(-50%);
    }
    
    &:hover {
      cursor: ${({disabled}) => 
        disabled ? 'not-allowed' : 'pointer'
      };
      background-image: radial-gradient(
        100% 75% at 50% 100%,
        #40e2f7 0%,
        #0041a2 100%
      );
      color: #f9e3bf;
    text-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
    box-shadow: inset 0 1px 10px 0 rgb(119, 155, 212)
    }
  
    /* &:focus, */
    &:active {
      outline: none;
      color: #bff9f4;
      text-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
      background-image: radial-gradient(
        100% 75% at 50% 100%,
        #25c5f5 0%,
        #000d85 100%
      );
      box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.4),
        inset 0 0 10px rgb(0, 42, 133), inset 0 3px 15px 0 rgb(0, 96, 174),
        inset 0 40px 0 0 rgba(98, 210, 254, 0.3),
        inset 0 20px 20px 0 rgba(69, 236, 248, 0.75), 0 0 0 2px #000,
        0 4px 0 0 #444; /* Button shadow when it is active */
    }
    &:disabled {
      &:before {
      background: none;
      top: 0px;left: 0px;right: 0px;bottom: 0px;
      }
      opacity: 0.6;
    }
`;

const StyledError = styled.div`
    background: #2a1a1a;
    border: 1px solid #5a2020;
    border-radius: 2px;
    padding: 12px 16px;
    margin-bottom: 24px;
    color: #e07070;
    font-size: 13px;
`;

// const StyledLog = styled.div<LogItemProps>`
//     background: ${({theme}) => theme.colors.bgMainDivColor};
//     border: 1px solid #5a2020;
//     border-radius: 2px;
//     padding: 12px 16px;
//     /* margin-bottom: 2px; */
//     color: ${props => {
//       switch (props.status) {
//         case 'ok': return '#4caf50';
//         case 'validate': return '#ff9800';
//         case 'error': return '#f44336';
//         default: return '#fff';
//       }}
//     };
//     /* font-size: 13px;     */
// `;

export const StyledInputSelect = styled.select `${StyledInput}`;
export const StyledInputSpan = styled.span `${StyledInput}`;
export {
    StyledButton,
    StyledError,
    // StyledLog,
};