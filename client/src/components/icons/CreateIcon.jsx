const CreateIcon = ({ className }) => (
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g clip-path="url(#clip0_27_11)">
            <circle cx="256" cy="256" r="229.935" stroke="var(--icon-secondary-color)" stroke-width="52.13"/>
            <rect x="230" y="100" width="52" height="312" rx="26" fill="var(--icon-primary-color)"/>
            <rect x="100" y="282" width="52" height="312" rx="26" transform="rotate(-90 100 282)" fill="var(--icon-primary-color)"/>
        </g>
        <defs>
            <clipPath id="clip0_27_11">
                <rect width="512" height="512" fill="white"/>
            </clipPath>
        </defs>
    </svg>
);

export default CreateIcon;