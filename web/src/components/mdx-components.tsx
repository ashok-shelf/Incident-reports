import type { MDXComponents } from "mdx/types";

export function getMDXComponents(): MDXComponents {
  return {
    img: (props) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...props}
        loading="lazy"
        alt={props.alt || ""}
        className="rounded border border-neutral-200 my-4 max-w-full"
      />
    ),
    table: (props) => (
      <div className="overflow-x-auto my-4">
        <table {...props} />
      </div>
    ),
    a: (props) => {
      const href = props.href || "";
      const isInternal =
        href.startsWith("/incidents") || href.startsWith("/runbooks");
      return (
        <a
          {...props}
          {...(isInternal
            ? {}
            : { target: "_blank", rel: "noopener noreferrer" })}
        />
      );
    },
  };
}
