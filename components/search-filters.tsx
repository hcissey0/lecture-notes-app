"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface SearchFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCourse: string
  onCourseChange: (value: string) => void
  selectedLecturer: string
  onLecturerChange: (value: string) => void
  courses: string[]
  lecturers: string[]
}

export function SearchFilters({
  searchTerm,
  onSearchChange,
  selectedCourse,
  onCourseChange,
  selectedLecturer,
  onLecturerChange,
  courses,
  lecturers,
}: SearchFiltersProps) {
  return (
    <div className="bg-card rounded-lg border-0 shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes, courses, lecturers, or tags..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-0 bg-muted/50"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={selectedCourse} onValueChange={onCourseChange}>
            <SelectTrigger className="w-[180px] border-0 bg-muted/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLecturer} onValueChange={onLecturerChange}>
            <SelectTrigger className="w-[180px] border-0 bg-muted/50">
              <SelectValue placeholder="All Lecturers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lecturers</SelectItem>
              {lecturers.map((lecturer) => (
                <SelectItem key={lecturer} value={lecturer}>
                  {lecturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
