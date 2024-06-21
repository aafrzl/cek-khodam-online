import React from "react";
import { subtitle, title } from "./primitives";

export default function Heading() {
  return (
    <div className="inline-block max-w-lg text-center justify-center">
      <h1 className={title()}>Check Khodam&nbsp;</h1>
      <h1 className={title({ color: "violet" })}>Online</h1>
      <p className={subtitle({ class: "mt-2 text-base" })}>
        Cek khodam yang ada pada tubuh seseorang melalui nama
      </p>
    </div>
  );
}
