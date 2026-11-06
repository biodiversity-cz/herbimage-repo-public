import { Link, type LinkProps } from 'react-router';

/** Bootstrap button variants usable for link styling. */
type LinkButtonVariant =
  'primary' | 'success' | 'outline-primary' | 'outline-secondary' | 'outline-danger';

export interface LinkButtonProps extends LinkProps {
  variant?: LinkButtonVariant;
  size?: 'sm' | 'lg';
}

/**
 * A react-router link styled as a Bootstrap button.
 *
 * React-Bootstrap's `Button` only accepts intrinsic tag names in its `as`
 * prop, so router links get their own small wrapper.
 */
export function LinkButton({ variant = 'primary', size, className, ...props }: LinkButtonProps) {
  const classes = ['btn', `btn-${variant}`];
  if (size !== undefined) {
    classes.push(`btn-${size}`);
  }
  if (className !== undefined) {
    classes.push(className);
  }
  return <Link className={classes.join(' ')} {...props} />;
}
