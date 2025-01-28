import React from "react";

import { useInView } from 'react-intersection-observer';

export default function useScrollPercentage() {
    const [ref, inView, entry] = useInView();
    const [percentage, setPercentage] = React.useState(0);

    const target = entry && entry.target;

    const calculateVerticalPercentage = (bounds) => {
        if (!window) {
            return 0;
        }
        const percentage = bounds.bottom / (window.innerHeight + bounds.height);
        return 1 - Math.max(0, Math.min(1, percentage));
    };

    React.useLayoutEffect(() => {
        const handleScroll = () => {
            if (!target) {
                return;
            };

            const bounds = target.getBoundingClientRect();
            const percentage = calculateVerticalPercentage(bounds);

            setPercentage(percentage);
        };

        if (inView) {
            window.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('load', handleScroll);
            window.addEventListener('resize', handleScroll);

            return () => {
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('load', handleScroll);
                window.removeEventListener('resize', handleScroll);
            }
        }

        handleScroll();
    }, [inView, target])

    return [ref, percentage, entry];
}
