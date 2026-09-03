import React from "react";

import InputAdornment from "@mui/material/InputAdornment";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTheme } from "@mui/material/styles";
import TextField, { type TextFieldProps } from "@mui/material/TextField";

import { inputSx, wave } from "../tidalTokens";

export type LunaNumberProps = TextFieldProps & {
	min?: number;
	max?: number;
	value?: number;
	defaultValue?: number;
	onNumber?: (num: number) => unknown;
};

export const LunaNumber = React.memo((props: LunaNumberProps) => {
	const theme = useTheme();
	const [number, setNumber] = React.useState<number>(isNaN(props.value!) ? (props.defaultValue ?? 0) : (props.value ?? 0));
	const onNumber = (number: any) => {
		const num = +number;
		if (isNaN(num)) return;
		if (props.max !== undefined && num > props.max) return;
		if (props.min !== undefined && num < props.min) return;
		setNumber(num);
		props.onNumber?.(num);
	};
	return (
		<TextField
			variant="outlined"
			slotProps={{
				input: {
					startAdornment: (
						<InputAdornment position="start">
							<RemoveIcon
								sx={{
									color: theme.palette.text.secondary,
									cursor: "pointer",
								}}
								onClick={() => onNumber(number - 1)}
							/>
						</InputAdornment>
					),
					endAdornment: (
						<InputAdornment position="end">
							<AddIcon
								sx={{
									color: theme.palette.text.secondary,
									cursor: "pointer",
								}}
								onClick={() => onNumber(number + 1)}
							/>
						</InputAdornment>
					),
				},
			}}
			onChange={(e) => onNumber(e.target.value)}
			value={number}
			{...props}
			// After the spread, so a caller cannot accidentally drop the centering again
			inputProps={{ style: { textAlign: "center", padding: 0 } }}
			sx={{
				width: 128,
				...inputSx,
				// The notched outline draws its own corners; without this it keeps the MUI default
				// radius and sits visibly inside the filled corners
				"& .MuiOutlinedInput-root": {
					...(inputSx as any)["& .MuiOutlinedInput-root"],
					borderRadius: wave.radiusSmall,
					// Zeroing the input padding to centre the value also collapsed the field, so the
					// height lives on the root instead
					height: 32,
					paddingLeft: 1,
					paddingRight: 1,
					"& .MuiOutlinedInput-notchedOutline": { borderRadius: wave.radiusSmall },
				},
				// The value sits between two adornments, so it needs to flex to centre between them
				"& .MuiInputBase-input": { textAlign: "center", padding: 0, flex: 1 },
				...props.sx,
			}}
		/>
	);
});
