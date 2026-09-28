import cn from "classnames";
import Link from "next/link";
import Image from "next/image";

type Props = {
  title: string;
  src: string;
  slug?: string;
  basePath?: string;
};

const CoverImage = ({ title, src, slug, basePath = "/posts" }: Props) => {
  const image = (
    <Image
      src={src}
      alt=""
      sizes="(min-width: 768px) 50vw, 100vw"
      className={cn("shadow-sm w-full", {
        "transition-shadow duration-200 group-hover:shadow-lg group-focus-visible:shadow-lg":
          slug,
      })}
      width={1300}
      height={630}
    />
  );
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link
          href={`${basePath}/${slug}`}
          aria-label={title}
          tabIndex={-1}
          aria-hidden="true"
          className="group block"
        >
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
};

export default CoverImage;
