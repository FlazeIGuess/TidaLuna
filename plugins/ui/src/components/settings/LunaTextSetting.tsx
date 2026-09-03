import React from "react";

import TextField, { type TextFieldProps } from "@mui/material/TextField";

import { type LunaTitleValues } from "../LunaTitle";
import { inputSx } from "../../tidalTokens";
import { LunaSetting } from "./LunaSetting";

export type LunaTextSettingProps = TextFieldProps & LunaTitleValues;
export const LunaTextSetting = React.memo((props: LunaTextSettingProps) => (
	<LunaSetting
		title={props.title}
		desc={props.desc}
		children={<TextField variant="outlined" size="small" fullWidth {...props} label={props.title} sx={{ ...inputSx, ...props.sx }} />}
	/>
));
