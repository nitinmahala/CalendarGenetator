"use client"

import { useState, useEffect } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWeekend,
} from "date-fns"
import { ChevronLeft, ChevronRight, Download, Printer, Plus, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Type for events
type Event = {
  id: string
  date: string
  title: string
  description: string
  color: string
}

export default function CalendarGenerator() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newEvent, setNewEvent] = useState<Omit<Event, "id">>({
    date: "",
    title: "",
    description: "",
    color: "#4f46e5",
  })
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Generate years for dropdown (current year ± 10 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  // Generate months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2000, i, 1)
    return format(date, "MMMM")
  })

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("calendar-events")
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    }
  }, [])

  // Save events to localStorage when they change
  useEffect(() => {
    localStorage.setItem("calendar-events", JSON.stringify(events))
  }, [events])

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Handle year change
  const handleYearChange = (year: string) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(Number.parseInt(year))
    setCurrentDate(newDate)
  }

  // Handle month change
  const handleMonthChange = (month: string) => {
    const monthIndex = months.findIndex((m) => m === month)
    const newDate = new Date(currentDate)
    newDate.setMonth(monthIndex)
    setCurrentDate(newDate)
  }

  // Get days for the current month view
  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }

  // Get day of week for the first day of the month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = () => {
    return startOfMonth(currentDate).getDay()
  }

  // Handle adding a new event
  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive",
      })
      return
    }

    const eventToAdd = {
      ...newEvent,
      id: crypto.randomUUID(),
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    }

    setEvents([...events, eventToAdd])
    setNewEvent({
      date: "",
      title: "",
      description: "",
      color: "#4f46e5",
    })
    setEventDialogOpen(false)

    toast({
      title: "Event added",
      description: "Your event has been successfully added to the calendar",
    })
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return events.filter((event) => event.date === dateString)
  }

  // Export calendar as PDF
  const exportAsPDF = () => {
    toast({
      title: "Export initiated",
      description: "Your calendar is being prepared for download as PDF",
    })
    // In a real implementation, we would use a library like jsPDF to generate the PDF
  }

  // Export calendar as image
  const exportAsImage = () => {
    toast({
      title: "Export initiated",
      description: "Your calendar is being prepared for download as image",
    })
    // In a real implementation, we would use html-to-image or similar library
  }

  // Print calendar
  const printCalendar = () => {
    window.print()
  }

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Render calendar grid
  const renderCalendarGrid = () => {
    const days = getDaysInMonth()
    const firstDayOfMonth = getFirstDayOfMonth()
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Create empty cells for days before the first day of the month
    const emptyCells = Array(firstDayOfMonth)
      .fill(null)
      .map((_, index) => <div key={`empty-${index}`} className="h-24 border border-border bg-muted/20"></div>)

    // Create cells for each day of the month
    const dayCells = days.map((day) => {
      const isToday = isSameDay(day, new Date())
      const isCurrentMonth = isSameMonth(day, currentDate)
      const isWeekendDay = isWeekend(day)
      const dayEvents = getEventsForDate(day)

      return (
        <div
          key={day.toString()}
          className={`h-24 border border-border p-1 transition-colors relative ${
            isToday ? "bg-primary/10" : ""
          } ${isWeekendDay ? "bg-muted/30" : ""}`}
          onClick={() => {
            setSelectedDate(day)
            setNewEvent((prev) => ({
              ...prev,
              date: format(day, "yyyy-MM-dd"),
            }))
            setEventDialogOpen(true)
          }}
        >
          <div className="flex justify-between items-start">
            <span
              className={`text-sm font-medium ${isToday ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : ""}`}
            >
              {format(day, "d")}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-xs bg-secondary text-secondary-foreground rounded-full px-1.5">
                {dayEvents.length}
              </span>
            )}
          </div>
          <div className="mt-1 space-y-1 max-h-[calc(100%-24px)] overflow-y-auto">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="text-xs p-1 rounded truncate"
                style={{ backgroundColor: `${event.color}20`, borderLeft: `3px solid ${event.color}` }}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )
    })

    return (
      <>
        {/* Days of week header */}
        {daysOfWeek.map((day) => (
          <div key={day} className="h-10 flex items-center justify-center font-medium bg-muted/50">
            {day}
          </div>
        ))}

        {/* Calendar grid with empty cells and day cells */}
        {emptyCells}
        {dayCells}
      </>
    )
  }

  // Render year calendar with all months
  const renderYearCalendar = () => {
    const year = currentDate.getFullYear()
    const today = new Date()
    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]

    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthDate = new Date(year, monthIndex, 1)
      const monthName = format(monthDate, "MMMM")
      const daysInMonth = getDaysInMonthForYear(monthDate)
      const firstDayOfMonth = startOfMonth(monthDate).getDay()

      // Create empty cells for days before the first day of the month
      const emptyCells = Array(firstDayOfMonth)
        .fill(null)
        .map((_, index) => <div key={`empty-${monthIndex}-${index}`} className="h-6 w-6"></div>)

      // Create cells for each day of the month
      const dayCells = daysInMonth.map((day) => {
        const isToday = isSameDay(day, today)
        const isWeekendDay = isWeekend(day)
        const dayEvents = getEventsForDate(day)
        const hasEvents = dayEvents.length > 0

        return (
          <div
            key={`${monthIndex}-${day.toString()}`}
            className={`h-6 w-6 flex items-center justify-center text-xs rounded-full
              ${isToday ? "bg-primary text-primary-foreground" : ""}
              ${isWeekendDay && !isToday ? "text-muted-foreground" : ""}
              ${hasEvents && !isToday ? "border border-primary" : ""}
            `}
            title={hasEvents ? `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : undefined}
          >
            {format(day, "d")}
          </div>
        )
      })

      return (
        <div key={monthIndex} className="border rounded-lg p-2 shadow-sm">
          <div className="text-center font-medium mb-2">{monthName}</div>
          <div className="grid grid-cols-7 gap-1">
            {/* Days of week header */}
            {daysOfWeek.map((day, i) => (
              <div
                key={`${monthIndex}-dow-${i}`}
                className="h-6 w-6 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Calendar grid with empty cells and day cells */}
            {emptyCells}
            {dayCells}
          </div>
        </div>
      )
    })
  }

  // Get days for a specific month (used in year view)
  const getDaysInMonthForYear = (date: Date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    return eachDayOfInterval({ start, end })
  }

  const getFirstDayOfMonthForYearView = (date: Date) => {
    return startOfMonth(date).getDay()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl print:py-2">
      <Card className="print:shadow-none">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 print:hidden">
          <div>
            <CardTitle className="text-2xl font-bold">Calendar Generator</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export options</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="grid gap-2">
                  <Button variant="outline" onClick={exportAsPDF} className="justify-start">
                    Export as PDF
                  </Button>
                  <Button variant="outline" onClick={exportAsImage} className="justify-start">
                    Export as Image
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={printCalendar}>
              <Printer className="h-4 w-4" />
              <span className="sr-only">Print calendar</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 print:hidden">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Select value={format(currentDate, "MMMM")} onValueChange={handleMonthChange}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>Create a new event for your calendar.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="event-date">Date</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-title">Title</Label>
                      <Input
                        id="event-title"
                        placeholder="Event title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea
                        id="event-description"
                        placeholder="Event description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-color">Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="event-color"
                          type="color"
                          value={newEvent.color}
                          onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                          className="w-12 h-8 p-1"
                        />
                        <span className="text-sm text-muted-foreground">Select a color for your event</span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddEvent}>Add Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="month" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="month">Month View</TabsTrigger>
              <TabsTrigger value="year">Year View</TabsTrigger>
            </TabsList>

            <TabsContent value="month" className="mt-0">
              <div className="print:text-center print:mb-4">
                <h2 className="text-xl font-bold print:text-2xl">{format(currentDate, "MMMM yyyy")}</h2>
              </div>

              <div className="grid grid-cols-7 gap-px mt-4">{renderCalendarGrid()}</div>
            </TabsContent>

            <TabsContent value="year" className="mt-0">
              <div className="print:text-center print:mb-4">
                <h2 className="text-xl font-bold print:text-2xl">{format(currentDate, "yyyy")} Calendar</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                {renderYearCalendar()}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between print:hidden">
          <div className="text-sm text-muted-foreground">Click on any day to add an event</div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary/10 border border-border mr-1"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-muted/30 border border-border mr-1"></div>
              <span>Weekend</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

