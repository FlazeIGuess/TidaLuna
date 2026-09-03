import type { LunaAuthor } from "@luna/core";

import Box, { type BoxProps } from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import React, { type PropsWithChildren, type ReactNode } from "react";

import { LunaAuthorDisplay, LunaLink } from "../../components";

export interface LunaPluginComponentProps extends PropsWithChildren {
	name: string;
	version?: string;
	link?: string;
	loadError?: string;
	author?: LunaAuthor | string;
	desc?: ReactNode;
	sx?: BoxProps["sx"];
	/** Far right of the header row, after the author. For buttons and metrics. */
	actions?: ReactNode;
}
export const LunaPluginHeader = React.memo(({ name, version, loadError, author, desc, children, sx, link, actions }: LunaPluginComponentProps) => (
	<Box sx={sx}>
		<Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
			{/* minWidth 0 lets a long name ellipsis instead of shoving the author off the card */}
			<Typography variant="h6" title={name} sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
				<LunaLink href={link}>{name}</LunaLink>
				{version && <Typography variant="caption" style={{ opacity: 0.7, marginLeft: 6 }} children={version} />}
			</Typography>
			{children}
			{loadError && (
				<Typography
					variant="caption"
					sx={{
						color: "white",
						fontWeight: 500,
						backgroundColor: "rgba(256, 0, 0, 0.5)",
						padding: 1,
						borderRadius: 1,
						paddingTop: 1.5,
					}}
					children={loadError}
				/>
			)}
			<Box sx={{ flexGrow: 1 }} /> {/* This pushes the author section to the right */}
			{author && <LunaAuthorDisplay author={author} sx={{ flexShrink: 0 }} />}
			{actions}
		</Stack>
		{desc && <Typography variant="subtitle2" gutterBottom children={desc} />}
	</Box>
));
