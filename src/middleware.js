export const onRequest = async (context, next) => {
  const url = new URL(context.request.url);

  // Redirect /posts paths to /blog
  if (url.pathname.startsWith("/posts/")) {
    return context.redirect("/blog" + url.pathname.slice(6), 301);
  }

  // Redirect /posts to /blog
  if (url.pathname === "/posts" || url.pathname === "/posts/") {
    return context.redirect("/blog", 301);
  }

  return next();
};
