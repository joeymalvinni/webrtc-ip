import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const cls = (input: string): string =>
    input
        .replace(/\s+/gm, ' ')
        .split(' ')
        .filter((cond: string) => typeof cond === 'string')
        .join(' ')
        .trim();

const classes = {
    base: 'focus:outline-none transition ease-in-out duration-200',
    disabled: 'opacity-50 cursor-not-allowed',
    pill: 'rounded-full',
    size: {
        small: 'px-2 py-1 text-sm',
        normal: 'px-3 py-2',
        large: 'px-8 py-3 text-lg',
    },
    variant: {
        primary:
            'bg-primary hover:bg-primary_hovered text-white font-ibm tracking-tigher rounded-md',
        secondary:
            'text-white bg-secondary hover:bg-secondary_hovered hover:text-[#C3C3D7] font-ibm rounded-md',
        danger:
            'bg-red-500 hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 text-white font-ibm',
    },
};

type ButtonProps = {
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'normal' | 'large';
    pill?: boolean;
    disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            type = 'button',
            className,
            variant = 'primary',
            size = 'normal',
            pill,
            disabled = false,
            ...props
        },
        ref
    ) => (
        <button
            ref={ref}
            disabled={disabled}
            type={type}
            className={cls(`
                ${classes.base}
                ${classes.size[size]}
                ${classes.variant[variant]}
                ${pill ? classes.pill : ''}
                ${disabled ? classes.disabled : ''}
                ${className}
            `)}
            {...props}
        >
            {children}
        </button>
    )
);

Button.propTypes = {
    children: PropTypes.node.isRequired,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    className: PropTypes.string,
    pill: PropTypes.bool,
    disabled: PropTypes.bool,
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
    size: PropTypes.oneOf(['small', 'normal', 'large']),
};

export default Button;
