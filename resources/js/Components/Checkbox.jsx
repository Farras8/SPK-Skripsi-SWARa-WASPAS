export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-navy-300 text-primary-600 shadow-sm focus:ring-primary-500 ' +
                className
            }
        />
    );
}
