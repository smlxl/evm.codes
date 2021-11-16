import * as React from 'react'

function SvgRemix(props: any) {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
      }}
      xmlns="http://www.w3.org/2000/svg"
      overflow="hidden"
      {...props}
    >
      <defs>
        <symbol id="remix_svg__ri-search-line" viewBox="0 0 32 32">
          <path d="M24.041 22.156l5.711 5.709-1.887 1.887-5.709-5.711a11.871 11.871 0 01-7.472 2.625h-.018.001c-6.624 0-12-5.376-12-12s5.376-12 12-12 12 5.376 12 12v.017c0 2.838-.99 5.446-2.643 7.495l.018-.023zm-2.674-.989A9.27 9.27 0 0024 14.682v-.015.001a9.33 9.33 0 00-9.333-9.333 9.33 9.33 0 00-9.333 9.333 9.33 9.33 0 009.333 9.333h.015a9.273 9.273 0 006.487-2.635l-.002.002.2-.2z" />
        </symbol>
        <symbol id="remix_svg__ri-contrast-2-fill" viewBox="0 0 32 32">
          <path d="M16 29.333C8.636 29.333 2.667 23.364 2.667 16S8.636 2.667 16 2.667 29.333 8.636 29.333 16 23.364 29.333 16 29.333zM7.105 21.9c1.941 2.874 5.187 4.739 8.868 4.739 5.891 0 10.667-4.776 10.667-10.667 0-3.682-1.865-6.928-4.703-8.845l-.038-.024c.283.97.445 2.085.445 3.238 0 3.314-1.344 6.315-3.517 8.486a11.959 11.959 0 01-8.486 3.517c-1.152 0-2.267-.162-3.322-.466l.085.021z" />
        </symbol>
        <symbol id="remix_svg__ri-arrow-down-s-line" viewBox="0 0 32 32">
          <path d="M16 17.563l6.6-6.6 1.885 1.885L16 21.333l-8.485-8.485L9.4 10.963z" />
        </symbol>
        <symbol id="remix_svg__ri-arrow-up-s-line" viewBox="0 0 32 32">
          <path d="M16 14.437l-6.6 6.6-1.885-1.885L16 10.667l8.485 8.485-1.885 1.885z" />
        </symbol>
        <symbol id="remix_svg__ri-gas-station-fill" viewBox="0 0 32 32">
          <path d="M4 25.333v-20C4 4.597 4.597 4 5.333 4h12c.736 0 1.333.597 1.333 1.333V16h2.667A2.667 2.667 0 0124 18.667V24a1.333 1.333 0 002.666 0v-9.333h-2.667a1.333 1.333 0 01-1.333-1.333V8.553l-2.209-2.209 1.885-1.885 6.6 6.6c.241.241.391.574.391.941v12.001a4 4 0 01-8 0v-5.333h-2.667v6.667h1.333v2.667H2.666v-2.667h1.333zM6.667 6.667v8H16v-8H6.667z" />
        </symbol>
        <symbol id="remix_svg__ri-fullscreen-line" viewBox="0 0 32 32">
          <path d="M26.667 4h2.667v8h-2.667V6.667h-5.333V4h5.333zM5.333 4h5.333v2.667H5.333V12H2.666V4h2.667zm21.334 21.333V20h2.667v8h-8v-2.667h5.333zm-21.334 0h5.333V28h-8v-8h2.667v5.333z" />
        </symbol>
        <symbol id="remix_svg__ri-arrow-down-s-line1" viewBox="0 0 32 32">
          <path d="M16 17.563l6.6-6.6 1.885 1.885L16 21.333l-8.485-8.485L9.4 10.963z" />
        </symbol>
        <symbol id="remix_svg__ri-arrow-go-forward-line" viewBox="0 0 32 32">
          <path d="M24.229 9.333h-9.563a8 8 0 000 16h12V28h-12C8.775 28 3.999 23.224 3.999 17.333S8.775 6.666 14.666 6.666h9.563l-3.381-3.381L22.733 1.4l6.6 6.6-6.6 6.6-1.885-1.885 3.381-3.381z" />
        </symbol>
        <symbol id="remix_svg__ri-arrow-left-s-line" viewBox="0 0 32 32">
          <path d="M14.437 16l6.6 6.6-1.885 1.885L10.667 16l8.485-8.485L21.037 9.4z" />
        </symbol>
        <symbol id="remix_svg__ri-arrow-right-s-line" viewBox="0 0 32 32">
          <path d="M17.563 16l-6.6-6.6 1.885-1.885L21.333 16l-8.485 8.485-1.885-1.885z" />
        </symbol>
        <symbol id="remix_svg__ri-checkbox-circle-line" viewBox="0 0 32 32">
          <path d="M16 29.333C8.636 29.333 2.667 23.364 2.667 16S8.636 2.667 16 2.667 29.333 8.636 29.333 16 23.364 29.333 16 29.333zm0-2.666c5.891 0 10.667-4.776 10.667-10.667S21.891 5.333 16 5.333 5.333 10.109 5.333 16 10.109 26.667 16 26.667zm-1.329-5.334l-5.657-5.657 1.885-1.885 3.772 3.772 7.541-7.543 1.887 1.885-9.428 9.428z" />
        </symbol>
        <symbol id="remix_svg__ri-command-line" viewBox="0 0 32 32">
          <path d="M13.333 10.667h5.333v-2a4.667 4.667 0 114.667 4.667h-2v5.333h2a4.667 4.667 0 11-4.667 4.667v-2h-5.333v2a4.667 4.667 0 11-4.667-4.667h2v-5.333h-2a4.667 4.667 0 114.667-4.667v2zm-2.666 0v-2a2 2 0 10-2 2h2zm0 10.666h-2a2 2 0 102 2v-2zm10.666-10.666h2a2 2 0 10-2-2v2zm0 10.666v2a2 2 0 102-2h-2zm-8-8v5.333h5.333v-5.333h-5.333z" />
        </symbol>
        <symbol id="remix_svg__ri-contrast-2-line" viewBox="0 0 32 32">
          <path d="M16 29.333C8.636 29.333 2.667 23.364 2.667 16S8.636 2.667 16 2.667 29.333 8.636 29.333 16 23.364 29.333 16 29.333zm0-2.666c5.891 0 10.667-4.776 10.667-10.667S21.891 5.333 16 5.333 5.333 10.109 5.333 16 10.109 26.667 16 26.667zm-6.667-6.24a11.939 11.939 0 007.609-3.484 11.92 11.92 0 003.482-7.57l.002-.04c2.161 1.455 3.564 3.893 3.564 6.658a8 8 0 01-14.64 4.464l-.018-.029z" />
        </symbol>
        <symbol id="remix_svg__ri-error-warning-line" viewBox="0 0 32 32">
          <path d="M16 29.333C8.636 29.333 2.667 23.364 2.667 16S8.636 2.667 16 2.667 29.333 8.636 29.333 16 23.364 29.333 16 29.333zm0-2.666c5.891 0 10.667-4.776 10.667-10.667S21.891 5.333 16 5.333 5.333 10.109 5.333 16 10.109 26.667 16 26.667zM14.667 20h2.667v2.667h-2.667V20zm0-10.667h2.667v8h-2.667v-8z" />
        </symbol>
        <symbol id="remix_svg__ri-git-branch-line" viewBox="0 0 32 32">
          <path d="M9.473 20.28A4.01 4.01 0 0112 24a4 4 0 11-5.361-3.764l.028-.009v-8.453c-1.568-.566-2.668-2.041-2.668-3.773a4 4 0 115.362 3.764l-.028.009v4.227a6.638 6.638 0 014-1.333h5.333a4.003 4.003 0 003.853-2.918l.007-.028a4.009 4.009 0 01-2.528-3.72 4 4 0 115.265 3.797l-.028.008c-.563 3.16-3.29 5.528-6.569 5.528h-5.333a4.003 4.003 0 00-3.853 2.919l-.007.028zM8 22.667a1.333 1.333 0 000 2.666 1.333 1.333 0 000-2.666zm0-16a1.333 1.333 0 000 2.666 1.333 1.333 0 000-2.666zm16 0a1.333 1.333 0 000 2.666 1.333 1.333 0 000-2.666z" />
        </symbol>
        <symbol id="remix_svg__ri-github-fill" viewBox="0 0 32 32">
          <path d="M16 2.667C8.633 2.667 2.667 8.634 2.667 16v.007c0 5.854 3.775 10.826 9.024 12.616l.094.028c.667.116.916-.284.916-.635 0-.316-.017-1.365-.017-2.483-3.349.617-4.216-.816-4.483-1.567-.151-.384-.8-1.567-1.367-1.884-.467-.249-1.133-.867-.017-.883 1.051-.017 1.8.967 2.051 1.367 1.2 2.016 3.117 1.449 3.883 1.1.117-.867.467-1.449.851-1.783-2.967-.333-6.067-1.484-6.067-6.584 0-1.451.516-2.649 1.367-3.584-.133-.333-.6-1.7.133-3.533 0 0 1.116-.349 3.667 1.368a12.096 12.096 0 013.309-.451h.026-.001c1.133 0 2.267.149 3.333.449 2.549-1.733 3.667-1.365 3.667-1.365.733 1.833.267 3.2.133 3.533.849.933 1.367 2.116 1.367 3.583 0 5.117-3.116 6.251-6.083 6.584.483.416.9 1.216.9 2.467 0 1.783-.017 3.216-.017 3.667 0 .349.251.765.917.632 5.324-1.837 9.081-6.804 9.083-12.649 0-7.367-5.967-13.333-13.333-13.333z" />
        </symbol>
        <symbol id="remix_svg__ri-home-2-line" viewBox="0 0 32 32">
          <path d="M25.333 28H6.666a1.333 1.333 0 01-1.333-1.333v-12h-4L15.102 2.15a1.328 1.328 0 011.795.001l-.001-.001 13.769 12.517h-4v12c0 .736-.597 1.333-1.333 1.333zM8 25.333h16V12.209l-8-7.272-8 7.272v13.124z" />
        </symbol>
        <symbol id="remix_svg__ri-information-line" viewBox="0 0 32 32">
          <path d="M16 29.333C8.636 29.333 2.667 23.364 2.667 16S8.636 2.667 16 2.667 29.333 8.636 29.333 16 23.364 29.333 16 29.333zm0-2.666c5.891 0 10.667-4.776 10.667-10.667S21.891 5.333 16 5.333 5.333 10.109 5.333 16 10.109 26.667 16 26.667zM14.667 9.333h2.667V12h-2.667V9.333zm0 5.334h2.667v8h-2.667v-8z" />
        </symbol>
        <symbol id="remix_svg__ri-links-line" viewBox="0 0 32 32">
          <path d="M17.413 10.813L19.3 12.7c1.689 1.689 2.734 4.023 2.734 6.6s-1.045 4.911-2.734 6.6l-.472.471a9.334 9.334 0 01-13.2-13.2l1.887 1.887a6.667 6.667 0 109.428 9.429l.472-.472c1.206-1.206 1.952-2.873 1.952-4.713s-.746-3.507-1.952-4.713l-1.887-1.887 1.887-1.885zm8.958 8.015l-1.885-1.885a6.667 6.667 0 10-9.428-9.429l-.472.472c-1.206 1.206-1.952 2.873-1.952 4.713s.746 3.507 1.952 4.713l1.887 1.887-1.887 1.885-1.885-1.885c-1.689-1.689-2.734-4.023-2.734-6.6s1.045-4.911 2.734-6.6l.472-.471a9.334 9.334 0 0113.2 13.2z" />
        </symbol>
        <symbol id="remix_svg__ri-play-circle-line" viewBox="0 0 32 32">
          <path d="M16 29.333C8.636 29.333 2.667 23.364 2.667 16S8.636 2.667 16 2.667 29.333 8.636 29.333 16 23.364 29.333 16 29.333zm0-2.666c5.891 0 10.667-4.776 10.667-10.667S21.891 5.333 16 5.333 5.333 10.109 5.333 16 10.109 26.667 16 26.667zM14.163 11.22l6.505 4.336a.535.535 0 01.002.887l-.002.001-6.507 4.336a.533.533 0 01-.828-.442v-8.675a.533.533 0 01.831-.441l-.002-.001z" />
        </symbol>
      </defs>
    </svg>
  )
}

export default SvgRemix
