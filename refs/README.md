# Reference images

Drop orthographic views, wireframes, schematics or screenshots in here and say which file goes with
which page. They are read directly off disk — a picture fetched from the web comes back as text and is
no use, but a file sitting here can be looked at.

Name them so the page is obvious:

    refs/enterprise-side.png      refs/enterprise-plan.png      refs/enterprise-front.png
    refs/voyager-side.png         refs/voyager-plan.png         refs/voyager-below.png
    refs/ds9-side.png             …

Any format works (png, jpg, webp). Orthographic views — straight side, plan, front, rear — are worth far
more than three-quarter beauty shots, because proportions can be measured off them directly instead of
being guessed at through perspective.

## How these get used

As **measuring references**, the way an artist works from a photograph: proportions, where one feature
sits relative to another, the shape of a curve, how far back the widest point is. Not traced, and not
converted into geometry. Every shape in `src/` stays this project's own, which is what the `attribution`
line in each city file and the note at the top of each module say, and those stay true.

If a file here is somebody's copyrighted drawing, that is fine for this purpose — it is reference, it is
not redistributed, and nothing derived from it is copied out of it. It does mean the files themselves
should not be committed, so this directory is ignored by git apart from this README.
