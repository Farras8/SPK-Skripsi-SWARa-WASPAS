import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    50: '#e6f0ff',
                    100: '#cce0ff',
                    200: '#99c2ff',
                    300: '#66a3ff',
                    400: '#3385ff',
                    500: '#0066ff',
                    600: '#0052cc',
                    700: '#003d99',
                    800: '#002966',
                    900: '#001433',
                    950: '#000a1a',
                },
                navy: {
                    50: '#e8eef5',
                    100: '#d1ddeb',
                    200: '#a3bbd7',
                    300: '#7599c3',
                    400: '#4777af',
                    500: '#19559b',
                    600: '#14447c',
                    700: '#0f335d',
                    800: '#0a223e',
                    900: '#05111f',
                    950: '#02080f',
                },
            },
        },
    },

    plugins: [forms],
};
