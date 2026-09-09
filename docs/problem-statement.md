# Problem Statement: Currency Converter

**Source:** Vibe Coding | Q <> TSEC (`Vibe Coding _ Q __ TSEC.pdf`)

## Mission
Develop a clean, fast utility for real-time currency conversion with historical trend visualization.

## Frontend UI & User Interaction
- **Dual Converter:** Side-by-side dropdown selectors (Source Currency, Target Currency) with an input field.
- **Trend Charts:** Line graph showing exchange rate movement over the last 30 days.
- **Favorites List:** A list of frequently used currency pairs for quick access.

## Backend Logic & State Management
- **Exchange Rates:** Fetches live conversion data via ExchangeRate API.
- **Local Persistence:** SQLite caches recent conversion history and user-defined currency favorites.

## The Vibe Check: Travel Budgeting Mode
Add a "Travel Budgeting" mode. If the user toggles this mode, they can input a base currency amount. The backend must then calculate and display the equivalent value in 5 major global currencies simultaneously in a comparison table.

## Submission / Architecture Notes (from PDF)
- All business logic, calculations, validations, and computations should be implemented on the server side. Frontend should primarily handle presentation and user interactions.
- Follow a clean, scalable, and well-structured architecture for both frontend and backend.
- Maintain meaningful and incremental Git commits.
- Submit public GitHub repository link on Unstop before deadline.
