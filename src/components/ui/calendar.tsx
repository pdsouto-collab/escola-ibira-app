"use client"

import * as React from "react"

export type CalendarProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> & {
    mode?: "single" | "range" | "multiple"
    selected?: any
    onSelect?: (date: any) => void
    initialFocus?: boolean
}

function Calendar({
    className,
    ...props
}: CalendarProps) {
    return (
        <div className={className}>
            <p className="p-4 text-center text-sm text-slate-500">Calendar Unavailable (React 19 Compatibility)</p>
        </div>
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
