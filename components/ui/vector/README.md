## Updating UI icons

The project uses [Remix Icons](https://remixicon.com/), so if you are adding new icons to the application, pick one from the library to ensure UI consistency. To use a new icon, follow these steps:

1. Go to [Remix](https://remixicon.com/) and import [icons.remixicon](icons.remixicon) via an _Import Collection_.
2. Find the icon you want to use, add it to the collection, download and update the [icons.remixicon](icons.remixicon) via an _Export Collection_.
3. Go to [Icomoon](https://icomoon.io/), create an empty set and upload all the SVGs you downloaded previously.
4. Select all icons, click "Generate SVG & More" and open preferences (gear icon near the Download button).
5. Here, for the _Name_ enter `remix`, and for the _Class Prefix_ enter `ri-`.
6. Download Icomoon pack, follow these commands to generate a React component with all the icons included as SVG defs:

```
unzip remix.zip
mv -f remix/symbol-defs.svg remix.svg
npx @svgr/cli remix.svg > components/ui/vector/Remix.tsx
```
