"use client"

import * as React from "react"

export type CalendarProps = React.HTMLAttributes<HTMLDivElement> & {
    mode?: "single" | "range" | "multiple"
    selected?: any
    onSelect?: any
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
