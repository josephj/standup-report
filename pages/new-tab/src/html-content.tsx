import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { forwardRef } from 'react';
import { HtmlContent as ChakraHtmlContentTheme } from './chakra-theme/html-content';

/**
 * This component is only to be used for "dangerouslySetInnerHTML"
 *
 * If you can write your own tags, you should do it with <Text variant="h1">
 * component, and etc.
 *
 * The whole point of this component - is to remove default tags styles, like
 * <a>, <h1>, <p> and etc, from leaking into components.
 */

export const HtmlContent = forwardRef(function HtmlContent(
  { sx, fontSize, ...rest }: BoxProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const styles = ChakraHtmlContentTheme.baseStyle;

  const customFontSize = {
    'p, li, td, th, blockquote': {
      fontSize,
    },
  };

  return <Box sx={{ ...styles, ...(fontSize ? customFontSize : {}), ...sx }} {...{ ref, ...rest }} />;
});
