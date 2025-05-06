const DownloadIcon = ({ className }) => (
    <svg
        width="512"
        height="512"
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <g clip-path="url(#clip0_34_28)">
            <rect x="230" width="52" height="381" rx="26" fill="var(--icon-primary-color)"/>
            <rect x="130.179" y="265.948" width="52" height="177.977" rx="26" transform="rotate(-45 130.179 265.948)" fill="var(--icon-primary-color)"/>
            <rect x="346.849" y="229" width="52" height="177.977" rx="26" transform="rotate(45 346.849 229)" fill="var(--icon-primary-color)"/>
            <path d="M256 512V460H81C57.8 460 52 440.667 52 431V357.5C52 352.7 47.6667 351.167 45.5 351H6.5C1.7 351 0.166667 355.333 0 357.5V464C0 502.4 32 512 48 512H256Z" fill="var(--icon-secondary-color)"/>
            <path d="M256 512V460H431C454.2 460 460 440.667 460 431V357.5C460 352.7 464.333 351.167 466.5 351H505.5C510.3 351 511.833 355.333 512 357.5V464C512 502.4 480 512 464 512H256Z" fill="var(--icon-secondary-color)"/>
        </g>
        <defs>
            <clipPath id="clip0_34_28">
                <rect width="512" height="512" fill="white"/>
            </clipPath>
        </defs>
    </svg>
);

export default DownloadIcon;