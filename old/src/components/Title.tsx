
type TitleProps = {
    title?: string,
};

export default function Title({ title = 'Titulo' }: TitleProps) {
    return (
        <div>
            <h1 className="mb-4 text-3xl font-bold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl"> { title } </h1>
        </div>
    );
}