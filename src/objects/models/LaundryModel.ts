export interface LaundryModel {
    dimensions: Dimensions
    roomOrientation: string
    machineScale: number
    upsideDownStacks: number
    objects: LaundryMachine[]
    schoolStyles: SchoolStyles
    userNotifications: UserNotifications
}

export interface Dimensions {
    x: number
    y: number
}

export interface LaundryMachine {
    x: number
    y: number
    wall_1_x?: number
    wall_1_y?: number
    wall_2_x?: number
    wall_2_y?: number
    type: string
    appliance_type?: string
    model_number?: string
    orientation?: string
    appliance_desc_key?: string
    appliance_desc?: string
    combo?: boolean
    stacked?: boolean
    opacity?: number
    status_toggle?: number
    average_run_time?: number
    time_remaining?: number
    time_left_lite?: string
    percentage?: number
}

export interface SchoolStyles {
    school_theme: string
    school_logo: string
    room_wall: string
    room_bg: string
    header_status_legend_bg: string
    header_status_legend_color: string
    content_box_bg: string
    content_box_color: string
}

export interface UserNotifications {}
