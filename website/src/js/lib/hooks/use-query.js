/**
 * React hook returns URLSearchParams based on react location hook.
 *
 * @param location
 * @returns {object} - A single URLSearchParams object.
 */
const useQuery = (location) => {
  return new URLSearchParams(location.search)
}

export default useQuery
