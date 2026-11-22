/** Rules shared by several templates' instructions. Changing one changes those templates: bump them. */

/** Models guess weekdays and holiday dates wrong; the run's context has today's. */
export const DATE_RULE =
  "- Dates: today's date, weekday and time zone are given at the start of each conversation. Work out any other date's weekday from today by counting the days, or check it in the calendar app; never guess a weekday or a holiday's date. If you can't confirm a weekday, write the date without one.";
